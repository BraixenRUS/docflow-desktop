import { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';

const typeColors = {
  'Договор': '#a78bfa',
  'Спецификация': '#60a5fa',
  'Счёт': '#fbbf24',
  'Платёжное поручение': '#34d399',
  'Накладная': '#fb923c',
  'Акт': '#2dd4bf',
  'Счёт-фактура': '#f472b6',
  'Письмо': '#94a3b8',
  'Доп. соглашение': '#c084fc',
  'Акт сверки': '#818cf8',
};

const stages = {
  queued: { label: 'В очереди', color: '#a1a1aa', progress: 0 },
  recognizing: { label: 'Распознавание текста', color: '#60a5fa', progress: 35 },
  analyzing: { label: 'Анализ документа', color: '#a78bfa', progress: 72 },
  completed: { label: 'Обработка завершена', color: '#34d399', progress: 100 },
  error: { label: 'Ошибка обработки', color: '#f87171', progress: 0 },
};

const initialDocuments = [
  { id: '1', label: 'Договор № 123', type: 'Договор', date: '01.09.2026', description: 'Договор на поставку компьютерного оборудования.', status: 'completed' },
  { id: '2', label: 'Спецификация № 1', type: 'Спецификация', date: '01.09.2026', description: 'Перечень оборудования и согласованные цены.', status: 'analyzing' },
  { id: '3', label: 'Счёт № 45', type: 'Счёт', date: '03.09.2026', description: 'Счёт на оплату поставки по договору № 123.', status: 'recognizing' },
  { id: '4', label: 'Платёжное поручение № 78', type: 'Платёжное поручение', date: '04.09.2026', description: 'Подтверждение перечисления денежных средств.', status: 'queued' },
  { id: '5', label: 'Накладная № 56', type: 'Накладная', date: '07.09.2026', description: 'Документ о передаче оборудования покупателю.', status: 'error' },
  { id: '6', label: 'Акт приёмки № 17', type: 'Акт', date: '07.09.2026', description: 'Подтверждение приёмки оборудования.', status: 'completed' },
  { id: '7', label: 'Счёт-фактура № 91', type: 'Счёт-фактура', date: '07.09.2026', description: 'Документ по НДС для поставленной продукции.', status: 'queued' },
  { id: '8', label: 'Письмо № 12', type: 'Письмо', date: '08.09.2026', description: 'Согласование даты поставки с контрагентом.', status: 'completed' },
  { id: '9', label: 'Доп. соглашение № 2', type: 'Доп. соглашение', date: '05.09.2026', description: 'Уточнение условий поставки.', status: 'analyzing' },
  { id: '10', label: 'Акт сверки № 4', type: 'Акт сверки', date: '10.09.2026', description: 'Сверка взаиморасчётов между сторонами.', status: 'completed' },
];

function DocumentNode({ data, selected }) {
  const stage = stages[data.status];

  return (
    <div
      className={`document-node ${selected ? 'document-node-selected' : ''}`}
      style={{ '--node-color': data.color }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="document-node-type">
        <span className="document-node-dot" />
        {data.type}
      </div>
      <div className="document-node-title">{data.label}</div>
      <div className="document-node-date">{data.date}</div>
      <div className="node-status" style={{ color: stage.color }}>
        <span className={`status-dot ${data.status === 'recognizing' || data.status === 'analyzing' ? 'status-dot-active' : ''}`} />
        {stage.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { document: DocumentNode };

const positions = [
  { id: '1', x: 0, y: 220 },
  { id: '2', x: 300, y: 40 },
  { id: '3', x: 300, y: 220 },
  { id: '4', x: 620, y: 40 },
  { id: '5', x: 620, y: 220 },
  { id: '6', x: 940, y: 220 },
  { id: '7', x: 940, y: 40 },
  { id: '8', x: 300, y: 450 },
  { id: '9', x: 620, y: 450 },
  { id: '10', x: 1260, y: 220 },
];


const connections = [
  ['1', '2'], ['1', '3'], ['1', '8'], ['1', '9'],
  ['2', '3'], ['3', '4'], ['3', '5'], ['5', '6'],
  ['5', '7'], ['4', '10'], ['6', '10'], ['7', '10'],
  ['9', '5'], ['8', '5'],
];

const initialEdges = connections.map(([source, target], i) => ({
  id: `edge-${i + 1}`,
  source,
  target,
  type: 'smoothstep',
  style: { stroke: '#8989a0', strokeWidth: 1.5 },
}));

function getProgress(status) {
  return stages[status].progress;
}

export default function App() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState(null);

  const selectedDocument = documents.find((doc) => doc.id === selectedId);
  const processingCount = documents.filter(
    (doc) => ['queued', 'recognizing', 'analyzing'].includes(doc.status)
  ).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setDocuments((current) =>
        current.map((doc) => {
          if (doc.status === 'recognizing') return { ...doc, status: 'analyzing' };
          if (doc.status === 'analyzing') return { ...doc, status: 'completed' };
          return doc;
        })
      );
    }, 12000);

    return () => clearInterval(timer);
  }, []);

  const updateStatus = (id, status) => {
    setDocuments((current) =>
      current.map((doc) => doc.id === id ? { ...doc, status } : doc)
    );
  };

  const startProcessing = (id) => {
    updateStatus(id, 'recognizing');
  };

  const nodes = positions.map(({ id, x, y }) => {
    const doc = documents.find((item) => item.id === id);
    return {
      id,
      type: 'document',
      position: { x, y },
      data: {
        label: doc.label,
        type: doc.type,
        date: doc.date,
        status: doc.status,
        color: typeColors[doc.type],
      },
    };
  });

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Архив документов</h1>
          <p>Граф взаимосвязей и обработка документов</p>
        </div>
        <span>В обработке: {processingCount}</span>
      </header>

      <div className="workspace">
        <div className="graph">
          <ReactFlow
            nodes={nodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            onNodeClick={(_, node) => setSelectedId(node.id)}
          >
            <Background color="#393943" gap={24} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <aside className="details">
          <h2>Обработка документа</h2>

          {selectedDocument ? (
            <div className="document-card">
              <span className="document-badge">{selectedDocument.type}</span>
              <h3>{selectedDocument.label}</h3>

              <div className="document-field">
                <span>ID документа</span>
                <strong>{selectedDocument.id}</strong>
              </div>

              <div className="document-field">
                <span>Дата</span>
                <strong>{selectedDocument.date}</strong>
              </div>

              <div className="document-field">
                <span>Статус</span>
                <strong
                  className="status-label"
                  style={{ color: stages[selectedDocument.status].color }}
                >
                  {stages[selectedDocument.status].label}
                </strong>
              </div>

              {['recognizing', 'analyzing'].includes(selectedDocument.status) && (
                <div className="progress-section">
                  <div className="progress-heading">
                    <span>Ход обработки</span>
                    <strong>{getProgress(selectedDocument.status)}%</strong>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuenow={getProgress(selectedDocument.status)}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Прогресс обработки"
                  >
                    <div
                      className="progress-fill"
                      style={{ width: `${getProgress(selectedDocument.status)}%` }}
                    />
                  </div>
                  <p className="helper-text">
                    Не закрывайте приложение. Обработка может занять некоторое время.
                  </p>
                </div>
              )}

              {selectedDocument.status === 'queued' && (
                <div className="notice notice-neutral">
                  Документ ожидает освобождения ресурсов для начала обработки.
                </div>
              )}

              {selectedDocument.status === 'error' && (
                <div className="notice notice-error">
                  Не удалось обработать документ. Проверьте файл и попробуйте ещё раз.
                </div>
              )}

              {selectedDocument.status === 'completed' && (
                <div className="notice notice-success">
                  Документ обработан. Результаты доступны для просмотра.
                </div>
              )}

              <div className="document-description">
                <span>Описание</span>
                <p>{selectedDocument.description}</p>
              </div>

              {selectedDocument.status === 'error' ? (
                <button onClick={() => startProcessing(selectedDocument.id)}>
                  Повторить обработку
                </button>
              ) : selectedDocument.status === 'queued' ? (
                <button onClick={() => startProcessing(selectedDocument.id)}>
                  Начать обработку
                </button>
              ) : (
                <button
                  onClick={() => updateStatus(selectedDocument.id, 'error')}
                  disabled={selectedDocument.status === 'completed'}
                >
                  Имитировать ошибку
                </button>
              )}

              <button className="secondary-button" onClick={() => setSelectedId(null)}>
                Сбросить выбор
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <p>Выбери документ на графе, чтобы посмотреть статус обработки.</p>
              <p>Цветная метка у каждого документа показывает его текущее состояние.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
