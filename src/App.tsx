
import { useState } from 'react';
import { analyzeRoulette, simulateBettingStrategy, simulateSquareBetting, analyzeCoincidences, analyzeLast10, analyzeSectors, analyzeNeighborsTargetBased, analyzeAutomaticPatterns, analyzeAllNeighbors, type AnalysisResult, type BettingResult, DEFAULT_BET_VALUES, type SequenceId, DEFAULT_COINCIDENCES, type CoincidenceStat, type Last10Analysis, type SectorAnalysisResult, type NeighborsAnalysisResult, type PatternAnalysisResult, type AllNeighborsAnalysisResult } from './logic/roulette';
import { analyzeWindowOptimization, type OptimizedCoincidenceResult } from './logic/windowOptimization';
import { analyzeTargetAsNeighbor, type TargetAsNeighborResult } from './logic/targetNeighborAnalysis';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

function App() {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini-api-key') || '';
  });
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [input, setInput] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [initialBankroll, setInitialBankroll] = useState<number>(500);
  const [betSequenceStr, setBetSequenceStr] = useState(DEFAULT_BET_VALUES.join(', '));
  const [activeTab, setActiveTab] = useState<'sequences' | 'squares' | 'coincidences' | 'sectors' | 'neighbors' | 'optimized'>('sequences');

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [bettingResult, setBettingResult] = useState<BettingResult | null>(null);
  const [squareBettingResult, setSquareBettingResult] = useState<BettingResult | null>(null);
  const [coincidenceStats, setCoincidenceStats] = useState<CoincidenceStat[] | null>(null);
  const [last10Analysis, setLast10Analysis] = useState<Last10Analysis | null>(null);
  const [sectorAnalysis, setSectorAnalysis] = useState<SectorAnalysisResult | null>(null);
  const [neighborsAnalysis, setNeighborsAnalysis] = useState<NeighborsAnalysisResult | null>(null);
  const [patternAnalysis, setPatternAnalysis] = useState<PatternAnalysisResult | null>(null);
  const [allNeighborsAnalysis, setAllNeighborsAnalysis] = useState<AllNeighborsAnalysisResult | null>(null);
  const [optimizedCoincidences, setOptimizedCoincidences] = useState<OptimizedCoincidenceResult[] | null>(null);
  const [targetAsNeighborResult, setTargetAsNeighborResult] = useState<TargetAsNeighborResult | null>(null);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [windowSize, setWindowSize] = useState<number>(1);
  const [neighborsCount, setNeighborsCount] = useState<number>(3);
  const [recentSpinsCount, setRecentSpinsCount] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);
  const [showSquaresLog, setShowSquaresLog] = useState(false);
  const [showBetLog, setShowBetLog] = useState(false);
  const [showSquareBetLog, setShowSquareBetLog] = useState(false);

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    setBettingResult(null);
    setSquareBettingResult(null);
    setCoincidenceStats(null);
    setLast10Analysis(null);
    setSectorAnalysis(null);
    setOptimizedCoincidences(null);
    setTargetAsNeighborResult(null);

    if (!input.trim()) {
      setError('Por favor, insira uma lista de números.');
      return;
    }

    // Parse input
    const numbers = input
      .trim()
      .split(/[,\s]+/)
      .map(s => parseInt(s, 10))
      .filter(n => !isNaN(n));

    if (numbers.length === 0) {
      setError('Nenhum número válido encontrado.');
      return;
    }

    // Parse bet sequence
    const betValues = betSequenceStr
      .split(/[,\s]+/)
      .map(s => parseFloat(s))
      .filter(n => !isNaN(n) && n > 0);

    if (betValues.length === 0) {
      setError('Sequência de apostas inválida.');
      return;
    }

    let numbersToProcess = [...numbers];
    if (isReversed) {
      numbersToProcess.reverse();
    }

    const analysis = analyzeRoulette(numbersToProcess);
    setResult(analysis);

    const betting = simulateBettingStrategy(numbersToProcess, initialBankroll, betValues);
    setBettingResult(betting);

    const sqBetting = simulateSquareBetting(numbersToProcess, initialBankroll, betValues);
    setSquareBettingResult(sqBetting);



    const coincidences = analyzeCoincidences(numbersToProcess, DEFAULT_COINCIDENCES);
    setCoincidenceStats(coincidences);

    const last10 = analyzeLast10(numbersToProcess, coincidences);
    setLast10Analysis(last10);

    const sectors = analyzeSectors(numbersToProcess, recentSpinsCount);
    setSectorAnalysis(sectors);

    const patterns = analyzeAutomaticPatterns(numbersToProcess, 5, 3);
    setPatternAnalysis(patterns);

    const optimized = analyzeWindowOptimization(numbersToProcess, DEFAULT_COINCIDENCES);
    setOptimizedCoincidences(optimized);

    // Set the first (most recent) number as the default target
    if (numbersToProcess.length > 0) {
      setTargetNumber(numbersToProcess[numbersToProcess.length - 1]);
    }
  };

  // Helper to find best sequence
  const getBestSequence = (stats: AnalysisResult['sequenceStats']) => {
    let bestSeq: SequenceId = 1;
    let maxPct = -1;
    (Object.keys(stats) as unknown as SequenceId[]).forEach(id => {
      if (stats[id].percentage > maxPct) {
        maxPct = stats[id].percentage;
        bestSeq = id;
      }
    });
    return { id: bestSeq, pct: maxPct };
  };

  // Helper to find best square
  const getBestSquare = (stats: AnalysisResult['squareStats']) => {
    let bestSq: SequenceId = 1;
    let maxPct = -1;
    (Object.keys(stats) as unknown as SequenceId[]).forEach(id => {
      if (stats[id].percentage > maxPct) {
        maxPct = stats[id].percentage;
        bestSq = id;
      }
    });
    return { id: bestSq, pct: maxPct };
  };

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('gemini-api-key', newKey);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;

        if (!apiKey) {
          setError('Por favor, configure sua API Key do Google Gemini primeiro.');
          setIsProcessingImage(false);
          return;
        }

        // Call Gemini Vision API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: 'Você é um sistema de extração numérica. Leia cada número da grade da esquerda para direita, de cima para baixo. Retorne APENAS os números separados por espaço, sem texto adicional.' },
                { inline_data: { mime_type: file.type, data: base64.split(',')[1] } }
              ]
            }]
          })
        });

        const data = await response.json();
        const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Clean and set the extracted numbers
        const cleanedNumbers = extractedText.trim().replace(/\n/g, ' ');
        setInput(cleanedNumbers);
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Erro ao processar imagem. Tente novamente.');
      setIsProcessingImage(false);
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    console.log('Paste event detected, items:', items.length);

    // Check if there's an image in the clipboard
    for (let i = 0; i < items.length; i++) {
      console.log('Item type:', items[i].type);

      if (items[i].type.indexOf('image') !== -1) {
        event.preventDefault(); // Prevent default paste behavior
        console.log('Image detected in clipboard');

        const file = items[i].getAsFile();
        if (!file) {
          console.log('Failed to get file from clipboard item');
          continue;
        }

        console.log('Processing image file:', file.name, file.type, file.size);
        setIsProcessingImage(true);
        setError(null);

        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target?.result as string;
            console.log('Image converted to base64, length:', base64.length);

            if (!apiKey) {
              setError('Por favor, configure sua API Key do Google Gemini primeiro.');
              setIsProcessingImage(false);
              return;
            }

            // Call Gemini Vision API
            console.log('Calling Gemini API...');

            try {
              const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [
                      { text: 'Você é um sistema de extração numérica extremamente preciso. Leia cada número da grade da esquerda para direita, de cima para baixo. Retorne APENAS os números separados por espaço, sem nenhum texto adicional, sem quebras de linha.' },
                      { inline_data: { mime_type: file.type, data: base64.split(',')[1] } }
                    ]
                  }]
                })
              });

              console.log('API response status:', response.status);

              if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API returned ${response.status}: ${errorText}`);
              }

              const data = await response.json();
              console.log('API response data:', data);

              const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              console.log('Extracted text:', extractedText);

              // Clean and set the extracted numbers
              const cleanedNumbers = extractedText.trim().replace(/\n/g, ' ');
              console.log('Cleaned numbers:', cleanedNumbers);

              setInput(cleanedNumbers);
              setIsProcessingImage(false);
            } catch (apiError) {
              console.error('API call failed:', apiError);
              setError(`Erro na API: ${apiError instanceof Error ? apiError.message : 'Erro desconhecido'}`);
              setIsProcessingImage(false);
            }
          };

          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            setError('Erro ao ler a imagem.');
            setIsProcessingImage(false);
          };

          reader.readAsDataURL(file);
        } catch (err) {
          console.error('Error processing image:', err);
          setError('Erro ao processar imagem. Tente novamente.');
          setIsProcessingImage(false);
        }

        break; // Process only the first image
      }
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Análise de Roleta</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Estratégia de Sequências 1-2-3 + Fibonacci</p>
      </div>

      <div className="input-section">
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent-color)', borderRadius: '8px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-color)' }}>
            🔑 API Key do Google Gemini (para extração de imagens)
          </label>
          <input
            type="password"
            placeholder="Cole sua API Key aqui (ex: AIzaSy...)"
            value={apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#020617',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'white',
              fontFamily: 'monospace'
            }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
            Obtenha gratuitamente em: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>Google AI Studio</a>
          </p>
        </div>

        <textarea
          placeholder="Cole aqui os números ou cole uma imagem (Ctrl+V) da grade de roleta..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPaste={handlePaste}
        />

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: '500'
          }}>
            {isProcessingImage ? '🔄 Processando imagem...' : '📷 Carregar imagem da grade'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isProcessingImage}
              style={{ display: 'none' }}
            />
          </label>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
            Envie uma foto da grade de números e eles serão extraídos automaticamente
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Banca Inicial (R$)
            </label>
            <input
              type="number"
              value={initialBankroll}
              onChange={(e) => setInitialBankroll(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#020617',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Sequência de Apostas (Fibonacci)
            </label>
            <input
              type="text"
              value={betSequenceStr}
              onChange={(e) => setBetSequenceStr(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#020617',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Giros Recentes (Setores)
            </label>
            <input
              type="number"
              value={recentSpinsCount}
              onChange={(e) => setRecentSpinsCount(Number(e.target.value))}
              min="5"
              max="100"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#020617',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'white'
              }}
            />
          </div>
        </div>

        <div className="controls">
          <label className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={isReversed}
              onChange={(e) => setIsReversed(e.target.checked)}
            />
            <span>Lista está de trás para frente (último sorteio primeiro)</span>
          </label>
          <button onClick={handleCalculate}>Calcular e Simular</button>
        </div>
        {error && <p style={{ color: 'var(--error-color)', marginTop: '1rem' }}>{error}</p>}
      </div>

      {result && (
        <>
          <h2 style={{ marginTop: '3rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Análise e Simulação
          </h2>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveTab('sequences')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'sequences' ? 'var(--accent-color)' : 'var(--card-bg)',
                border: activeTab === 'sequences' ? 'none' : '1px solid var(--border-color)'
              }}
            >
              Sequências (1-2-3)
            </button>
            <button
              onClick={() => setActiveTab('squares')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'squares' ? 'var(--accent-color)' : 'var(--card-bg)',
                border: activeTab === 'squares' ? 'none' : '1px solid var(--border-color)'
              }}
            >
              Quadrados (1-12, 13-24, 25-36)
            </button>
            <button
              onClick={() => setActiveTab('coincidences')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'coincidences' ? 'var(--accent-color)' : 'var(--card-bg)',
                border: activeTab === 'coincidences' ? 'none' : '1px solid var(--border-color)'
              }}
            >
              Coincidências
            </button>
            <button
              onClick={() => setActiveTab('sectors')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'sectors' ? 'var(--accent-color)' : 'var(--card-bg)',
                border: activeTab === 'sectors' ? 'none' : '1px solid var(--border-color)'
              }}
            >
              Setores (Tier/Orphelins/Voisins)
            </button>
            <button
              onClick={() => setActiveTab('neighbors')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'neighbors' ? 'var(--accent-color)' : 'var(--card-bg)',
                border: activeTab === 'neighbors' ? 'none' : '1px solid var(--border-color)'
              }}
            >
              Vizinhos na Roda
            </button>
            <button
              onClick={() => setActiveTab('optimized')}
              style={{
                flex: 1,
                backgroundColor: activeTab === 'optimized' ? 'var(--accent-color)' : 'var(--card-bg)',
                border: activeTab === 'optimized' ? 'none' : '1px solid var(--border-color)'
              }}
            >
              Coincidências Otimizadas
            </button>
          </div>

          {activeTab === 'sequences' && bettingResult && (
            <>
              {/* SEQUENCES CONTENT */}
              <div className="card" style={{
                marginBottom: '1.5rem',
                border: '1px solid var(--success-color)',
                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>Sequência com Mais Acertos</h3>
                    <div className="value" style={{ fontSize: '2rem' }}>
                      Seq. {getBestSequence(result.sequenceStats).id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="value" style={{ fontSize: '2rem', color: 'var(--success-color)' }}>
                      {getBestSequence(result.sequenceStats).pct.toFixed(1)}%
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>dos sorteios</p>
                  </div>
                </div>
              </div>

              {/* Betting Summary for Sequences */}
              <h3 style={{ marginBottom: '1rem' }}>
                Simulação de Apostas (Sequências)
                {bettingResult.status === 'BROKE' && <span style={{ color: 'var(--error-color)', marginLeft: '1rem' }}>🚨 QUEBROU</span>}
                {bettingResult.status === 'SURVIVED' && <span style={{ color: 'var(--success-color)', marginLeft: '1rem' }}>✅ SOBREVIVEU</span>}
              </h3>

              <div className="results-grid">
                <div className="card">
                  <h3>Saldo Final</h3>
                  <div className="value" style={{ color: bettingResult.finalBalance >= initialBankroll ? 'var(--success-color)' : 'var(--error-color)' }}>
                    R$ {bettingResult.finalBalance.toFixed(2)}
                  </div>
                </div>
                <div className="card">
                  <h3>Pior Banca</h3>
                  <div className="value" style={{ color: 'var(--error-color)' }}>
                    R$ {bettingResult.lowestBalance.toFixed(2)}
                  </div>
                </div>
                <div className="card">
                  <h3>Aposta Máxima</h3>
                  <div className="value">
                    R$ {bettingResult.maxBetUsed.toFixed(2)}
                  </div>
                </div>
                <div className="card">
                  <h3>Estatísticas</h3>
                  <div className="value" style={{ fontSize: '1.5rem' }}>
                    {bettingResult.totalWins}V / {bettingResult.totalLosses}D
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '2rem', height: '300px', padding: '1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Evolução da Banca (Sequências)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bettingResult.log}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="spinIndex" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Saldo']}
                      labelFormatter={(label) => `Giro ${label}`}
                    />
                    <ReferenceLine y={initialBankroll} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="balanceAfter"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="log-section" style={{ marginBottom: '2rem' }}>
                <button
                  onClick={() => setShowBetLog(!showBetLog)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    width: '100%'
                  }}
                >
                  {showBetLog ? 'Ocultar Log de Apostas (Sequências)' : 'Ver Log de Apostas (Sequências)'}
                </button>

                {showBetLog && (
                  <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Número</th>
                          <th>Aposta em</th>
                          <th>Valor</th>
                          <th>Resultado</th>
                          <th>Lucro</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bettingResult.log.map((row) => (
                          <tr key={row.spinIndex}>
                            <td>{row.spinIndex}</td>
                            <td>{row.number}</td>
                            <td>Seq. {row.betSequence}</td>
                            <td>R$ {row.betAmount.toFixed(2)}</td>
                            <td className={row.result === 'WIN' ? 'status-hit' : 'status-miss'}>
                              {row.result === 'WIN' ? 'VITÓRIA' : 'DERROTA'}
                            </td>
                            <td style={{ color: row.profit >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                              {row.profit >= 0 ? '+' : ''}{row.profit.toFixed(2)}
                            </td>
                            <td style={{ fontWeight: 'bold' }}>
                              R$ {row.balanceAfter.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Sequência</th>
                      <th>Maior jejum</th>
                      <th>Acertos Totais</th>
                      <th>Onde aconteceu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="seq-badge">Seq. 1</span></td>
                      <td>{result.maxGaps[1]} giros</td>
                      <td>{result.sequenceStats[1].hits} ({result.sequenceStats[1].percentage.toFixed(1)}%)</td>
                      <td>{result.gapDetails[1] || '-'}</td>
                    </tr>
                    <tr>
                      <td><span className="seq-badge">Seq. 2</span></td>
                      <td>{result.maxGaps[2]} giros</td>
                      <td>{result.sequenceStats[2].hits} ({result.sequenceStats[2].percentage.toFixed(1)}%)</td>
                      <td>{result.gapDetails[2] || '-'}</td>
                    </tr>
                    <tr>
                      <td><span className="seq-badge">Seq. 3</span></td>
                      <td>{result.maxGaps[3]} giros</td>
                      <td>{result.sequenceStats[3].hits} ({result.sequenceStats[3].percentage.toFixed(1)}%)</td>
                      <td>{result.gapDetails[3] || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="log-section" style={{ marginBottom: '3rem' }}>
                <button
                  onClick={() => setShowLog(!showLog)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    width: '100%'
                  }}
                >
                  {showLog ? 'Ocultar Detalhes de Jejum' : 'Ver Detalhes de Jejum'}
                </button>

                {showLog && (
                  <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Número</th>
                          <th>Seq. Ativa</th>
                          <th>Resultado</th>
                          <th>Próx. Seq.</th>
                          <th>Jejum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.log.map((row) => (
                          <tr key={row.spinIndex}>
                            <td>{row.spinIndex}</td>
                            <td>{row.number}</td>
                            <td>Seq. {row.activeSeqBefore}</td>
                            <td className={row.isHit ? 'status-hit' : 'status-miss'}>
                              {row.isHit ? 'ACERTO' : 'ERRO'}
                            </td>
                            <td>Seq. {row.activeSeqAfter}</td>
                            <td>{row.currentGap}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'squares' && squareBettingResult && (
            <>
              {/* SQUARES CONTENT */}
              <div className="card" style={{
                marginBottom: '1.5rem',
                border: '1px solid var(--accent-color)',
                background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ color: 'var(--accent-color)', marginBottom: '0.5rem' }}>Quadrado com Mais Acertos</h3>
                    <div className="value" style={{ fontSize: '2rem' }}>
                      Quadrado {getBestSquare(result.squareStats).id}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="value" style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>
                      {getBestSquare(result.squareStats).pct.toFixed(1)}%
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>dos sorteios</p>
                  </div>
                </div>
              </div>

              {/* Betting Summary for Squares */}
              <h3 style={{ marginBottom: '1rem' }}>
                Simulação de Apostas (Quadrados)
                {squareBettingResult.status === 'BROKE' && <span style={{ color: 'var(--error-color)', marginLeft: '1rem' }}>🚨 QUEBROU</span>}
                {squareBettingResult.status === 'SURVIVED' && <span style={{ color: 'var(--success-color)', marginLeft: '1rem' }}>✅ SOBREVIVEU</span>}
              </h3>

              <div className="results-grid">
                <div className="card">
                  <h3>Saldo Final</h3>
                  <div className="value" style={{ color: squareBettingResult.finalBalance >= initialBankroll ? 'var(--success-color)' : 'var(--error-color)' }}>
                    R$ {squareBettingResult.finalBalance.toFixed(2)}
                  </div>
                </div>
                <div className="card">
                  <h3>Pior Banca</h3>
                  <div className="value" style={{ color: 'var(--error-color)' }}>
                    R$ {squareBettingResult.lowestBalance.toFixed(2)}
                  </div>
                </div>
                <div className="card">
                  <h3>Aposta Máxima</h3>
                  <div className="value">
                    R$ {squareBettingResult.maxBetUsed.toFixed(2)}
                  </div>
                </div>
                <div className="card">
                  <h3>Estatísticas</h3>
                  <div className="value" style={{ fontSize: '1.5rem' }}>
                    {squareBettingResult.totalWins}V / {squareBettingResult.totalLosses}D
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '2rem', height: '300px', padding: '1rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Evolução da Banca (Quadrados)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={squareBettingResult.log}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="spinIndex" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Saldo']}
                      labelFormatter={(label) => `Giro ${label}`}
                    />
                    <ReferenceLine y={initialBankroll} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="balanceAfter"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="log-section" style={{ marginBottom: '2rem' }}>
                <button
                  onClick={() => setShowSquareBetLog(!showSquareBetLog)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    width: '100%'
                  }}
                >
                  {showSquareBetLog ? 'Ocultar Log de Apostas (Quadrados)' : 'Ver Log de Apostas (Quadrados)'}
                </button>

                {showSquareBetLog && (
                  <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Número</th>
                          <th>Aposta em</th>
                          <th>Valor</th>
                          <th>Resultado</th>
                          <th>Lucro</th>
                          <th>Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {squareBettingResult.log.map((row) => (
                          <tr key={row.spinIndex}>
                            <td>{row.spinIndex}</td>
                            <td>{row.number}</td>
                            <td>Quad. {row.betSequence}</td>
                            <td>R$ {row.betAmount.toFixed(2)}</td>
                            <td className={row.result === 'WIN' ? 'status-hit' : 'status-miss'}>
                              {row.result === 'WIN' ? 'VITÓRIA' : 'DERROTA'}
                            </td>
                            <td style={{ color: row.profit >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                              {row.profit >= 0 ? '+' : ''}{row.profit.toFixed(2)}
                            </td>
                            <td style={{ fontWeight: 'bold' }}>
                              R$ {row.balanceAfter.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Quadrado</th>
                      <th>Intervalo</th>
                      <th>Acertos Totais</th>
                      <th>Maior Jejum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><span className="seq-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>Quadrado 1</span></td>
                      <td>1 a 12</td>
                      <td>{result.squareStats[1].hits} ({result.squareStats[1].percentage.toFixed(1)}%)</td>
                      <td>{result.squareStats[1].maxGap} giros</td>
                    </tr>
                    <tr>
                      <td><span className="seq-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>Quadrado 2</span></td>
                      <td>13 a 24</td>
                      <td>{result.squareStats[2].hits} ({result.squareStats[2].percentage.toFixed(1)}%)</td>
                      <td>{result.squareStats[2].maxGap} giros</td>
                    </tr>
                    <tr>
                      <td><span className="seq-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>Quadrado 3</span></td>
                      <td>25 a 36</td>
                      <td>{result.squareStats[3].hits} ({result.squareStats[3].percentage.toFixed(1)}%)</td>
                      <td>{result.squareStats[3].maxGap} giros</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="log-section" style={{ marginBottom: '3rem' }}>
                <button
                  onClick={() => setShowSquaresLog(!showSquaresLog)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-color)',
                    width: '100%'
                  }}
                >
                  {showSquaresLog ? 'Ocultar Detalhes de Quadrados' : 'Ver Detalhes de Quadrados'}
                </button>

                {showSquaresLog && (
                  <div className="table-container" style={{ marginTop: '1rem' }}>
                    <table className="log-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Número</th>
                          <th>Quadrado</th>
                          <th>Jejum Q1</th>
                          <th>Jejum Q2</th>
                          <th>Jejum Q3</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.squaresLog.map((row) => (
                          <tr key={row.spinIndex}>
                            <td>{row.spinIndex}</td>
                            <td>{row.number}</td>
                            <td>
                              {row.hitSquare ? (
                                <span className="seq-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>
                                  Quad {row.hitSquare}
                                </span>
                              ) : '-'}
                            </td>
                            <td style={{ color: row.hitSquare === 1 ? 'var(--success-color)' : 'inherit' }}>
                              {row.gaps[1]}
                            </td>
                            <td style={{ color: row.hitSquare === 2 ? 'var(--success-color)' : 'inherit' }}>
                              {row.gaps[2]}
                            </td>
                            <td style={{ color: row.hitSquare === 3 ? 'var(--success-color)' : 'inherit' }}>
                              {row.gaps[3]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'coincidences' && coincidenceStats && last10Analysis && (
            <>
              {/* COINCIDENCES CONTENT */}
              <div className="card" style={{
                marginBottom: '1.5rem',
                border: '1px solid var(--accent-color)',
                background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), transparent)'
              }}>
                <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem' }}>Análise de Coincidências</h3>
                <div className="table-container" style={{ margin: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Gatilho</th>
                        <th>Faixa Alvo</th>
                        <th>Janela</th>
                        <th>Ocorrências</th>
                        <th>Acertos</th>
                        <th>% Acerto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coincidenceStats.map((stat) => (
                        <tr key={stat.config.id}>
                          <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{stat.config.trigger}</td>
                          <td>{stat.config.targetRangeStart} – {stat.config.targetRangeEnd}</td>
                          <td>{stat.config.window} giros</td>
                          <td>{stat.triggerCount}</td>
                          <td style={{ color: 'var(--success-color)' }}>{stat.hitCount}</td>
                          <td style={{ fontWeight: 'bold', color: stat.percentage > 50 ? 'var(--success-color)' : 'inherit' }}>
                            {stat.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Últimos 10 Giros</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {last10Analysis.last10Numbers.map((num, idx) => (
                    <div key={idx} style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? 'var(--accent-color)' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      border: idx === 0 ? '2px solid white' : 'none'
                    }}>
                      {num}
                    </div>
                  ))}
                </div>

                {last10Analysis.alerts.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--success-color)', marginBottom: '1rem' }}>
                    <h4 style={{ color: 'var(--success-color)', marginTop: 0, marginBottom: '0.5rem' }}>🎯 Oportunidades Identificadas</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {last10Analysis.alerts.map((alert, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {last10Analysis.repeatedEndings.length > 0 && (
                  <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--accent-color)' }}>
                    <h4 style={{ color: 'var(--accent-color)', marginTop: 0, marginBottom: '0.5rem' }}>🔢 Finais Repetidos (Últimos 10)</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {last10Analysis.repeatedEndings.map((stat, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>
                          O final <strong>'{stat.ending}'</strong> apareceu {stat.count} vezes.
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* AUTOMATIC PATTERNS */}
              {patternAnalysis && (
                <>
                  <div className="card" style={{
                    marginBottom: '1.5rem',
                    border: '1px solid #f59e0b',
                    background: 'linear-gradient(to right, rgba(245, 158, 11, 0.1), transparent)'
                  }}>
                    <h3 style={{ color: '#f59e0b', marginBottom: '1rem' }}>🔍 Padrões Detectados Automaticamente</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      Análise automática de números que aparecem próximos uns dos outros (janela de {patternAnalysis.windowSize} giros).
                    </p>



                    <h4 style={{ color: '#f59e0b', marginTop: '1.5rem', marginBottom: '1rem' }}>👨‍👩‍👦 Grupos de 3 Números</h4>
                    {patternAnalysis.topGroups.length > 0 ? (
                      <div className="table-container" style={{ margin: 0, marginBottom: '1.5rem' }}>
                        <table>
                          <thead>
                            <tr>
                              <th>Grupo</th>
                              <th>Ocorrências</th>
                              <th>% da Sequência</th>
                              <th>Distância Média</th>
                            </tr>
                          </thead>
                          <tbody>
                            {patternAnalysis.topGroups.map((group, idx) => {
                              const lastNumber = last10Analysis?.last10Numbers[0];

                              return (
                                <tr key={idx}>
                                  <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {group.numbers.map(num => {
                                        const isLastNumber = num === lastNumber;

                                        return (
                                          <span
                                            key={num}
                                            style={{
                                              display: 'inline-block',
                                              padding: '0.25rem 0.6rem',
                                              backgroundColor: isLastNumber ? '#fbbf24' : '#f59e0b',
                                              color: isLastNumber ? '#000000' : 'white',
                                              borderRadius: '4px',
                                              fontWeight: 'bold'
                                            }}
                                          >
                                            {num}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </td>
                                  <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{group.occurrences}x</td>
                                  <td style={{ color: group.percentage >= 5 ? '#10b981' : 'inherit' }}>
                                    {group.percentage.toFixed(1)}%
                                  </td>
                                  <td>{group.avgDistance.toFixed(1)} giros</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Nenhum grupo frequente detectado (mínimo 3 ocorrências).
                      </p>
                    )}

                    <h4 style={{ color: '#f59e0b', marginTop: '1.5rem', marginBottom: '1rem' }}>🔥 Números Mais Frequentes</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                      {patternAnalysis.frequentNumbers.slice(0, 10).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: idx === 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                            border: idx === 0 ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}
                        >
                          {idx === 0 && (
                            <div style={{
                              fontSize: '0.7rem',
                              color: '#f59e0b',
                              fontWeight: 'bold',
                              marginBottom: '0.25rem'
                            }}>
                              🏆 MAIS FREQUENTE
                            </div>
                          )}
                          <div style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: idx === 0 ? '#f59e0b' : 'white',
                            marginBottom: '0.25rem'
                          }}>
                            {item.number}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {item.count}x ({item.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'sectors' && sectorAnalysis && (
            <>
              {/* SECTORS CONTENT */}
              <div className="card" style={{
                marginBottom: '1.5rem',
                border: '1px solid #8b5cf6',
                background: 'linear-gradient(to right, rgba(139, 92, 246, 0.1), transparent)'
              }}>
                <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>🎯 Setor Mais Quente (Últimos {recentSpinsCount} Giros)</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div>
                    <div className="value" style={{ fontSize: '2.5rem', color: '#8b5cf6' }}>
                      {sectorAnalysis.hottestSector.id.toUpperCase()}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      {sectorAnalysis.hottestSector.percentage.toFixed(1)}% dos últimos {recentSpinsCount} giros
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TIER</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: sectorAnalysis.hottestSector.id === 'tier' ? '#8b5cf6' : 'inherit' }}>
                      {sectorAnalysis.recentStats.tier.percentage.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {sectorAnalysis.recentStats.tier.hits} acertos
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>ORPHELINS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: sectorAnalysis.hottestSector.id === 'orphelins' ? '#8b5cf6' : 'inherit' }}>
                      {sectorAnalysis.recentStats.orphelins.percentage.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {sectorAnalysis.recentStats.orphelins.hits} acertos
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>VOISINS</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: sectorAnalysis.hottestSector.id === 'voisins' ? '#8b5cf6' : 'inherit' }}>
                      {sectorAnalysis.recentStats.voisins.percentage.toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {sectorAnalysis.recentStats.voisins.hits} acertos
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>📊 Maior Jejum por Setor (Toda Sequência)</h3>
                <div className="table-container" style={{ margin: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Setor</th>
                        <th>Números</th>
                        <th>Acertos Totais</th>
                        <th>% Total</th>
                        <th>Maior Jejum</th>
                        <th>Onde Aconteceu</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="seq-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>TIER</span></td>
                        <td style={{ fontSize: '0.85rem' }}>5,8,10,11,13,16,23,24,27,30,33,36</td>
                        <td>{sectorAnalysis.stats.tier.hits}</td>
                        <td>{sectorAnalysis.stats.tier.percentage.toFixed(1)}%</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--error-color)' }}>{sectorAnalysis.stats.tier.maxGap} giros</td>
                        <td>{sectorAnalysis.stats.tier.maxGapRange}</td>
                      </tr>
                      <tr>
                        <td><span className="seq-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>ORPHELINS</span></td>
                        <td style={{ fontSize: '0.85rem' }}>1,6,9,14,17,20,31,34</td>
                        <td>{sectorAnalysis.stats.orphelins.hits}</td>
                        <td>{sectorAnalysis.stats.orphelins.percentage.toFixed(1)}%</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--error-color)' }}>{sectorAnalysis.stats.orphelins.maxGap} giros</td>
                        <td>{sectorAnalysis.stats.orphelins.maxGapRange}</td>
                      </tr>
                      <tr>
                        <td><span className="seq-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>VOISINS</span></td>
                        <td style={{ fontSize: '0.85rem' }}>0,2,3,4,7,12,15,18,19,21,22,25,26,28,29,32,35</td>
                        <td>{sectorAnalysis.stats.voisins.hits}</td>
                        <td>{sectorAnalysis.stats.voisins.percentage.toFixed(1)}%</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--error-color)' }}>{sectorAnalysis.stats.voisins.maxGap} giros</td>
                        <td>{sectorAnalysis.stats.voisins.maxGapRange}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {sectorAnalysis.endingsAnalysis.length > 0 && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>🔢 Finais Repetidos e Setores (Últimos {recentSpinsCount} Giros)</h3>
                  <div className="table-container" style={{ margin: 0 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Final</th>
                          <th>Repetições</th>
                          <th>Tier</th>
                          <th>Orphelins</th>
                          <th>Voisins</th>
                          <th>Setor Dominante</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectorAnalysis.endingsAnalysis.map((ending) => {
                          const maxSector = Object.entries(ending.sectorDistribution)
                            .reduce((max, [sector, count]) => count > max.count ? { sector, count } : max, { sector: '', count: 0 });

                          return (
                            <tr key={ending.ending}>
                              <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>'{ending.ending}'</td>
                              <td>{ending.count}x</td>
                              <td style={{ color: ending.sectorDistribution.tier > 0 ? 'var(--success-color)' : 'inherit' }}>
                                {ending.sectorDistribution.tier}
                              </td>
                              <td style={{ color: ending.sectorDistribution.orphelins > 0 ? 'var(--success-color)' : 'inherit' }}>
                                {ending.sectorDistribution.orphelins}
                              </td>
                              <td style={{ color: ending.sectorDistribution.voisins > 0 ? 'var(--success-color)' : 'inherit' }}>
                                {ending.sectorDistribution.voisins}
                              </td>
                              <td>
                                <span className="seq-badge" style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
                                  {maxSector.sector.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'neighbors' && (
            <>
              {/* NEIGHBORS CONTENT */}
              <div className="card" style={{
                marginBottom: '1.5rem',
                border: '1px solid #10b981',
                background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent)'
              }}>
                <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>🎯 Vizinhos na Roda Europeia</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Analise o que acontece nos próximos giros após cada vez que um número-alvo aparece, verificando se ele ou seus vizinhos saem nesse intervalo.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Número-Alvo
                    </label>
                    <select
                      value={targetNumber}
                      onChange={(e) => setTargetNumber(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#020617',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    >
                      {Array.from({ length: 37 }, (_, i) => i).map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Vizinhos de Cada Lado
                    </label>
                    <select
                      value={neighborsCount}
                      onChange={(e) => setNeighborsCount(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#020617',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    >
                      <option value={2}>2 vizinhos</option>
                      <option value={3}>3 vizinhos</option>
                      <option value={4}>4 vizinhos</option>
                      <option value={5}>5 vizinhos</option>
                      <option value={6}>6 vizinhos</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Janela de Análise (X giros)
                    </label>
                    <input
                      type="number"
                      value={windowSize}
                      onChange={(e) => setWindowSize(Number(e.target.value))}
                      min="1"
                      max="20"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#020617',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem'
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!input.trim()) {
                      setError('Por favor, insira uma lista de números primeiro.');
                      return;
                    }

                    const numbers = input
                      .trim()
                      .split(/[,\s]+/)
                      .map(s => parseInt(s, 10))
                      .filter(n => !isNaN(n));

                    if (numbers.length === 0) {
                      setError('Nenhum número válido encontrado.');
                      return;
                    }

                    let numbersToProcess = [...numbers];
                    if (isReversed) {
                      numbersToProcess.reverse();
                    }

                    const analysis = analyzeNeighborsTargetBased(numbersToProcess, targetNumber, windowSize);
                    setNeighborsAnalysis(analysis);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#10b981',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Calcular Estatística de Vizinhos
                </button>

                <button
                  onClick={() => {
                    if (!input.trim()) {
                      setError('Por favor, insira uma lista de números primeiro.');
                      return;
                    }

                    const numbers = input
                      .trim()
                      .split(/[,\s]+/)
                      .map(s => parseInt(s, 10))
                      .filter(n => !isNaN(n));

                    if (numbers.length === 0) {
                      setError('Nenhum número válido encontrado.');
                      return;
                    }

                    let numbersToProcess = [...numbers];
                    if (isReversed) {
                      numbersToProcess.reverse();
                    }

                    const allAnalysis = analyzeAllNeighbors(numbersToProcess, windowSize);
                    setAllNeighborsAnalysis(allAnalysis);
                    setError(null);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: '#3b82f6',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginTop: '0.5rem'
                  }}
                >
                  Gerar Tabela Completa (Todos os Números)
                </button>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                  <h3 style={{ color: '#8b5cf6', marginBottom: '1rem' }}>🎯 Alvo como Vizinho</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Verifique se o número seguinte ao alvo cai na vizinhança de algum centro específico (considerando {neighborsCount} vizinhos).
                  </p>

                  <button
                    onClick={() => {
                      if (!input.trim()) {
                        setError('Por favor, insira uma lista de números primeiro.');
                        return;
                      }

                      const numbers = input
                        .trim()
                        .split(/[,\s]+/)
                        .map(s => parseInt(s, 10))
                        .filter(n => !isNaN(n));

                      if (numbers.length === 0) {
                        setError('Nenhum número válido encontrado.');
                        return;
                      }

                      let numbersToProcess = [...numbers];
                      if (isReversed) {
                        numbersToProcess.reverse();
                      }

                      const analysis = analyzeTargetAsNeighbor(numbersToProcess, targetNumber, neighborsCount);
                      setTargetAsNeighborResult(analysis);
                      setError(null);
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#8b5cf6',
                      border: 'none',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      color: 'white',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '1rem'
                    }}
                  >
                    Analisar Alvo {targetNumber} com {neighborsCount} Vizinhos
                  </button>

                  {targetAsNeighborResult && (
                    <div style={{ marginTop: '1.5rem' }}>
                      {targetAsNeighborResult.centers.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                          {targetAsNeighborResult.centers.map((centerStat) => (
                            <div key={centerStat.center} className="card" style={{ border: '1px solid #8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
                              <h3 style={{ color: '#8b5cf6', marginBottom: '0.5rem' }}>
                                Centro {centerStat.center} ({centerStat.k} vizinhos)
                              </h3>
                              <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Ocorrências do Alvo: </span>
                                <strong>{centerStat.targetOccurrences}</strong>
                              </div>
                              <div style={{ marginBottom: '0.5rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Acertos (Next in Range): </span>
                                <strong style={{ color: 'var(--success-color)' }}>{centerStat.hits}</strong>
                              </div>
                              <div style={{ marginBottom: '1rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>% de Acerto: </span>
                                <strong style={{ fontSize: '1.2rem' }}>{centerStat.percentage.toFixed(1)}%</strong>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                  Números Cobertos:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                  {centerStat.coveredNumbers.map((num, idx) => (
                                    <span key={idx} style={{
                                      backgroundColor: '#334155',
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '4px',
                                      fontSize: '0.8rem'
                                    }}>
                                      {num}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                          Nenhum centro com {targetAsNeighborResult.k} vizinhos conseguiu cobrir o sorteio seguinte ao número alvo {targetAsNeighborResult.target}.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {neighborsAnalysis && (
                <>
                  <div className="card" style={{
                    marginBottom: '1.5rem',
                    border: '1px solid #10b981',
                    background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent)'
                  }}>
                    <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>
                      📊 Resumo da Análise
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Número-Alvo
                        </div>
                        <div className="value" style={{ fontSize: '2rem', color: '#10b981' }}>
                          {neighborsAnalysis.targetNumber}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Ocorrências do Alvo
                        </div>
                        <div className="value" style={{ fontSize: '2rem' }}>
                          {neighborsAnalysis.validOccurrences}
                          {neighborsAnalysis.targetOccurrences !== neighborsAnalysis.validOccurrences && (
                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                              de {neighborsAnalysis.targetOccurrences}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                          Janela de Análise
                        </div>
                        <div className="value" style={{ fontSize: '2rem' }}>
                          {neighborsAnalysis.windowSize} {neighborsAnalysis.windowSize === 1 ? 'giro' : 'giros'}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '1rem', marginBottom: 0 }}>
                      Os percentuais consideram os {neighborsAnalysis.windowSize} {neighborsAnalysis.windowSize === 1 ? 'sorteio seguinte' : 'sorteios seguintes'} a cada vez que o número-alvo {neighborsAnalysis.targetNumber} apareceu, verificando se ele ou algum dos seus vizinhos saiu nesse intervalo.
                    </p>
                  </div>

                  <div className="card" style={{
                    marginBottom: '1.5rem',
                    border: '1px solid #10b981',
                    background: 'linear-gradient(to right, rgba(16, 185, 129, 0.1), transparent)'
                  }}>
                    <h3 style={{ color: '#10b981', marginBottom: '1rem' }}>
                      🏆 Melhor Desempenho: {neighborsAnalysis.bestK} Vizinhos
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div className="value" style={{ fontSize: '2.5rem', color: '#10b981' }}>
                          {neighborsAnalysis.bestPercentage.toFixed(1)}%
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          Taxa de acerto
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                          Acertos: <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                            {neighborsAnalysis.neighborStats.find(s => s.k === neighborsAnalysis.bestK)?.hits} de {neighborsAnalysis.validOccurrences}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {neighborsAnalysis.neighborStats.map((stat) => (
                      <div
                        key={stat.k}
                        className="card"
                        style={{
                          border: stat.k === neighborsAnalysis.bestK ? '2px solid #10b981' : '1px solid var(--border-color)',
                          position: 'relative',
                          backgroundColor: stat.k === neighborsAnalysis.bestK ? 'rgba(16, 185, 129, 0.05)' : 'var(--card-bg)'
                        }}
                      >
                        {stat.k === neighborsAnalysis.bestK && (
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            🏆 MELHOR
                          </div>
                        )}
                        <h3 style={{ marginBottom: '1rem', color: stat.k === neighborsAnalysis.bestK ? '#10b981' : 'inherit' }}>
                          Com {stat.k} Vizinhos
                        </h3>
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            Conjunto apostado ({stat.numbers.length} números):
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '8px'
                          }}>
                            {stat.numbers.map(num => (
                              <span
                                key={num}
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  backgroundColor: num === neighborsAnalysis.targetNumber ? '#10b981' : '#334155',
                                  borderRadius: '4px',
                                  fontSize: '0.9rem',
                                  fontWeight: num === neighborsAnalysis.targetNumber ? 'bold' : 'normal'
                                }}
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Acertos: </span>
                          <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {stat.hits} de {stat.totalOccurrences}
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>Taxa de acerto: </span>
                          <span style={{
                            fontWeight: 'bold',
                            fontSize: '1.5rem',
                            color: stat.percentage >= 50 ? '#10b981' : stat.percentage >= 30 ? '#f59e0b' : 'inherit'
                          }}>
                            {stat.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* CARD: Grupos com o Último Número */}
                    {patternAnalysis && last10Analysis && (() => {
                      const lastNumber = last10Analysis.last10Numbers[0];
                      const groupsWithLastNumber = patternAnalysis.topGroups.filter(group =>
                        group.numbers.includes(lastNumber)
                      );

                      if (groupsWithLastNumber.length === 0) return null;

                      return (
                        <div
                          className="card"
                          style={{
                            border: '1px solid #fbbf24',
                            position: 'relative',
                            backgroundColor: 'rgba(251, 191, 36, 0.05)'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            backgroundColor: '#fbbf24',
                            color: '#000000',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            ⭐ GRUPOS COM {lastNumber}
                          </div>
                          <h3 style={{ marginBottom: '1rem', color: '#fbbf24', paddingRight: '120px' }}>
                            Padrões Detectados
                          </h3>
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              Grupos que contêm o último número ({lastNumber}):
                            </div>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                              padding: '0.75rem',
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '8px'
                            }}>
                              {groupsWithLastNumber.map((group, idx) => (
                                <div
                                  key={idx}
                                  style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    backgroundColor: 'rgba(251, 191, 36, 0.1)',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(251, 191, 36, 0.3)'
                                  }}
                                >
                                  {group.numbers.map(num => {
                                    const isLastNumber = num === lastNumber;
                                    return (
                                      <span
                                        key={num}
                                        style={{
                                          display: 'inline-block',
                                          padding: '0.4rem 0.7rem',
                                          backgroundColor: isLastNumber ? '#fbbf24' : '#f59e0b',
                                          color: isLastNumber ? '#000000' : 'white',
                                          borderRadius: '6px',
                                          fontSize: '1.1rem',
                                          fontWeight: 'bold',
                                          minWidth: '40px',
                                          textAlign: 'center'
                                        }}
                                      >
                                        {num}
                                      </span>
                                    );
                                  })}
                                  <div style={{
                                    marginLeft: 'auto',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)'
                                  }}>
                                    {group.occurrences}x ({group.percentage.toFixed(1)}%)
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.85rem',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                            marginTop: '0.5rem'
                          }}>
                            💡 Estes grupos apareceram juntos {groupsWithLastNumber.length > 1 ? 'múltiplas vezes' : 'na sequência analisada'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}

              {/* ALL NEIGHBORS TABLE */}
              {allNeighborsAnalysis && (
                <div className="card" style={{
                  marginBottom: '1.5rem',
                  border: '1px solid #3b82f6',
                  background: 'linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent)'
                }}>
                  <h3 style={{ color: '#3b82f6', marginBottom: '1rem' }}>📊 Tabela Completa - Todos os Números</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    Percentual de acerto para cada número e quantidade de vizinhos (janela de {allNeighborsAnalysis.windowSize} {allNeighborsAnalysis.windowSize === 1 ? 'giro' : 'giros'}).
                  </p>

                  <div className="table-container" style={{ margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Número</th>
                          <th>Ocorrências</th>
                          <th>2 Vizinhos</th>
                          <th>3 Vizinhos</th>
                          <th>4 Vizinhos</th>
                          <th>5 Vizinhos</th>
                          <th>6 Vizinhos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allNeighborsAnalysis.rows.map((row) => {
                          const bestPct = Math.max(...Object.values(row.percentages));

                          return (
                            <tr key={row.number}>
                              <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {row.number}
                              </td>
                              <td style={{ color: row.occurrences === 0 ? 'var(--text-secondary)' : 'inherit' }}>
                                {row.occurrences === 0 ? '-' : row.occurrences}
                              </td>
                              {[2, 3, 4, 5, 6].map(k => {
                                const pct = row.percentages[k];
                                const isBest = pct === bestPct && pct > 0;

                                return (
                                  <td
                                    key={k}
                                    style={{
                                      backgroundColor: isBest ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                      fontWeight: isBest ? 'bold' : 'normal',
                                      color: row.occurrences === 0 ? 'var(--text-secondary)' :
                                        pct >= 70 ? '#10b981' :
                                          pct >= 50 ? '#f59e0b' :
                                            'inherit'
                                    }}
                                  >
                                    {row.occurrences === 0 ? '-' : `${pct.toFixed(1)}%`}
                                    {isBest && pct > 0 && ' 🏆'}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    <h4 style={{ color: '#3b82f6', marginTop: 0, marginBottom: '0.5rem' }}>📖 Legenda:</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
                      <li><span style={{ color: '#10b981' }}>Verde (≥70%)</span>: Excelente taxa de acerto</li>
                      <li><span style={{ color: '#f59e0b' }}>Laranja (≥50%)</span>: Boa taxa de acerto</li>
                      <li><strong>🏆</strong>: Melhor quantidade de vizinhos para este número</li>
                      <li><span style={{ color: 'var(--text-secondary)' }}>-</span>: Número não apareceu na sequência</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'optimized' && optimizedCoincidences && (
            <div className="card" style={{
              marginBottom: '1.5rem',
              border: '1px solid #e879f9', // Pink/Fuchsia
              background: 'linear-gradient(to right, rgba(232, 121, 249, 0.1), transparent)'
            }}>
              <h3 style={{ color: '#e879f9', marginBottom: '1rem' }}>⚡ Coincidências Otimizadas por Velocidade</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Identificação da janela de giros ideal (2 a 10) para cada gatilho, classificando pela rapidez do acerto.
              </p>
              <div className="table-container" style={{ margin: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Gatilho</th>
                      <th>Faixa Alvo</th>
                      <th>Melhor Janela</th>
                      <th>% Acerto Nessa Janela</th>
                      <th>Eficiência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optimizedCoincidences.map((stat, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{stat.config.trigger}</td>
                        <td>{stat.config.targetRangeStart} – {stat.config.targetRangeEnd}</td>
                        <td style={{ fontWeight: 'bold' }}>{stat.bestWindow} giros</td>
                        <td style={{
                          color: stat.bestPercentage >= 80 ? 'var(--success-color)' :
                            stat.bestPercentage >= 50 ? '#f59e0b' : 'inherit',
                          fontWeight: 'bold'
                        }}>
                          {stat.bestPercentage.toFixed(1)}%
                        </td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            fontSize: '0.9rem',
                            color: stat.urgency === 'Alta Urgência' ? '#f59e0b' : // Star/Gold
                              stat.urgency === 'Médio Prazo' ? '#facc15' : // Yellow
                                '#f87171' // Red
                          }}>
                            {stat.efficiencyIcon} {stat.urgency}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
