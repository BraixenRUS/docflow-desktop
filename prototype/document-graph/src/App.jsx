import mockGraph from './data/mockGraph.json';
import { useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
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

const initialDocuments = mockGraph.documents;

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

const initialNodes = positions.map(({ id, x, y }) => {
  const doc = initialDocuments.find((item) => item.id === id);

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

const connections = mockGraph.connections;

const initialEdges = connections.map((connection, index) => ({
  id: `e${index + 1}`,
  source: connection.source,
  target: connection.target,
  type: 'smoothstep',
  label: connection.label,
  style: {
    stroke: '#8989a0',
    strokeWidth: 1.5,
  },
  labelStyle: {
    fill: '#c4c4d4',
    fontSize: 10,
  },
  labelBgStyle: {
    fill: '#1c1a1d',
  },
  labelBgPadding: [4, 3],
  labelBgBorderRadius: 4,
}));

function getProgress(status) {
  return stages[status].progress;
}

export default function App() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [selectedId, setSelectedId] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

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

  useEffect(() => {
  setNodes((currentNodes) =>
    currentNodes.map((node) => {
      const doc = documents.find((item) => item.id === node.id);

      if (!doc) return node;

      return {
        ...node,
        data: {
          ...node.data,
          label: doc.label,
          type: doc.type,
          date: doc.date,
          status: doc.status,
          color: typeColors[doc.type],
        },
      };
    })
  );
}, [documents, setNodes]);

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
            onNodesChange={onNodesChange}
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
