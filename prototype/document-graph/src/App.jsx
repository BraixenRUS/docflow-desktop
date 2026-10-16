import { useState } from 'react';
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

function DocumentNode({ data, selected }) {
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

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = {
  document: DocumentNode,
};


const documents = [
  { id: '1', label: 'Договор № 123', type: 'Договор', date: '01.09.2026', description: 'Договор на поставку компьютерного оборудования.' },
  { id: '2', label: 'Спецификация № 1', type: 'Спецификация', date: '01.09.2026', description: 'Перечень оборудования и согласованные цены.' },
  { id: '3', label: 'Счёт № 45', type: 'Счёт', date: '03.09.2026', description: 'Счёт на оплату поставки по договору № 123.' },
  { id: '4', label: 'Платёжное поручение № 78', type: 'Платёжное поручение', date: '04.09.2026', description: 'Подтверждение перечисления денежных средств.' },
  { id: '5', label: 'Накладная № 56', type: 'Накладная', date: '07.09.2026', description: 'Документ о передаче оборудования покупателю.' },
  { id: '6', label: 'Акт приёмки № 17', type: 'Акт', date: '07.09.2026', description: 'Подтверждение приёмки оборудования.' },
  { id: '7', label: 'Счёт-фактура № 91', type: 'Счёт-фактура', date: '07.09.2026', description: 'Документ по НДС для поставленной продукции.' },
  { id: '8', label: 'Письмо № 12', type: 'Письмо', date: '08.09.2026', description: 'Согласование даты поставки с контрагентом.' },
  { id: '9', label: 'Доп. соглашение № 2', type: 'Доп. соглашение', date: '05.09.2026', description: 'Уточнение условий поставки.' },
  { id: '10', label: 'Акт сверки № 4', type: 'Акт сверки', date: '10.09.2026', description: 'Сверка взаиморасчётов между сторонами.' },
];

const initialNodes = [
  { id: '1', position: { x: 0, y: 150 } },
  { id: '2', position: { x: 240, y: 30 } },
  { id: '3', position: { x: 240, y: 150 } },
  { id: '4', position: { x: 480, y: 30 } },
  { id: '5', position: { x: 480, y: 150 } },
  { id: '6', position: { x: 720, y: 150 } },
  { id: '7', position: { x: 720, y: 30 } },
  { id: '8', position: { x: 240, y: 300 } },
  { id: '9', position: { x: 480, y: 300 } },
  { id: '10', position: { x: 960, y: 150 } },
].map((node) => {
  const doc = documents.find((item) => item.id === node.id);

  return {
    ...node,
    data: { label: doc.label },
    style: {
      background: '#24242b',
      color: '#f4f4f5',
      border: '1px solid #77778a',
      borderRadius: 10,
      padding: 14,
      width: 190,
    },
  };
});

const connections = [
  ['1', '2'],
  ['1', '3'],
  ['1', '8'],
  ['1', '9'],
  ['2', '3'],
  ['3', '4'],
  ['3', '5'],
  ['5', '6'],
  ['5', '7'],
  ['4', '10'],
  ['6', '10'],
  ['7', '10'],
  ['9', '5'],
  ['8', '5'],
];

const initialEdges = connections.map(([source, target], i) => ({
  id: `edge-${i + 1}`,
  source,
  target,
  type: 'smoothstep',
  style: { stroke: '#8989a0', strokeWidth: 1.5 },
}));




export default function App() {
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Архив документов</h1>
          <p>Граф взаимосвязей</p>
        </div>
        <span>Документов: {documents.length}</span>
      </header>

      <div className="workspace">
        <div className="graph">
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2}
            onNodeClick={(_, node) => {
              const doc = documents.find((item) => item.id === node.id);
              setSelectedDocument(doc);
            }}
          >
            <Background color="#393943" gap={24} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <aside className="details">
          <h2>Документ</h2>
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

              <div className="document-description">
                <span>Описание</span>
                <p>{selectedDocument.description}</p>
              </div>

              <button onClick={() => setSelectedDocument(null)}>
                Сбросить выбор
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <p>Выбери узел на графе, чтобы посмотреть сведения о документе.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
