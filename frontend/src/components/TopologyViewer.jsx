import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { useSearchParams } from 'react-router-dom';
import CustomNode from './CustomNode'; // We will create this

export default function TopologyViewer() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  // This tells React Flow about our custom node type
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  useEffect(() => {
    const customerId = searchParams.get('customer_id');
    const fdhId = searchParams.get('fdh_id');
    const assetSerial = searchParams.get('asset_serial');

    let url = '';
    if (customerId) {
      url = `/api/topology/customer/${customerId}`;
    } else if (fdhId) {
      url = `/api/topology/fdh/${fdhId}`;
    } else if (assetSerial) {
      url = `/api/topology/search?serial=${assetSerial}`;
    } else {
      setError('No customer, FDH, or asset selected.');
      return;
    }

    setLoading(true);
    setError(null);
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.detail || 'Failed to load topology') });
        }
        return res.json();
      })
      .then((data) => {
        // Add default edge styles
        const styledEdges = data.edges.map(edge => ({
          ...edge,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
          style: { stroke: '#6b7280', strokeWidth: 2 }
        }));
        
        setNodes(data.nodes);
        setEdges(styledEdges);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchParams, setNodes, setEdges]); // Re-run when search params change

  if (loading) return <p className="text-gray-700">Loading topology...</p>;
  
  if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">Error: {error}</p>;

  return (
    <div className="w-full h-[calc(100vh-130px)] bg-gray-50 rounded-lg shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes} // Register our custom node
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
