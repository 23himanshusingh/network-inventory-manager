import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import FDHForm from './FDHForm';
import SplitterForm from './SplitterForm';
import FDHEditForm from './FDHEditForm'; // Import new edit form
import SplitterEditForm from './SplitterEditForm'; // Import new edit form

// Reusable Edit Button
const EditButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="ml-2 text-xs font-medium text-blue-600 hover:text-blue-800"
  >
    (Edit)
  </button>
);

// Reusable Add Button
const AddButton = ({ onClick, text }) => (
  <button
    onClick={onClick}
    className="ml-4 py-1 px-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
  >
    + {text}
  </button>
);

export default function NetworkHierarchy() {
  const [headends, setHeadends] = useState([]);
  const [fdhList, setFdhList] = useState([]); // Flat list of all FDHs for the form
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null); // 'addFdh', 'addSplitter', 'editFdh', 'editSplitter'
  const [modalTitle, setModalTitle] = useState('');
  const [currentItem, setCurrentItem] = useState(null); // To hold the item being edited
  // --- End Modal State ---

  const fetchHierarchy = async () => {
    setLoading(true);
    try {
      // Fetch both data sets in parallel
      const [headendsRes, fdhsRes] = await Promise.all([
        fetch('/api/network-hierarchy/headends'),
        fetch('/api/network-hierarchy/fdhs')
      ]);

      if (!headendsRes.ok || !fdhsRes.ok) {
        throw new Error('Network response was not ok');
      }
      
      const headendsData = await headendsRes.json();
      const fdhsData = await fdhsRes.json();

      setHeadends(headendsData);
      setFdhList(fdhsData); // Save the flat list for the splitter edit form
      setLoading(false);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch data on initial component mount
  useEffect(() => {
    fetchHierarchy();
  }, []);

  // --- Modal Handlers ---
  const openAddFdhModal = (headendId) => {
    setCurrentItem({ headend_id: headendId }); // Pass the parent ID
    setModalTitle('Add New FDH');
    setModalContent('addFdh');
    setModalOpen(true);
  };

  const openAddSplitterModal = (fdhId) => {
    setCurrentItem({ fdh_id: fdhId }); // Pass the parent ID
    setModalTitle('Add New Splitter');
    setModalContent('addSplitter');
    setModalOpen(true);
  };

  const openEditFdhModal = (fdh) => {
    setCurrentItem(fdh); // Pass the whole FDH object
    setModalTitle(`Edit FDH: ${fdh.name}`);
    setModalContent('editFdh');
    setModalOpen(true);
  };

  const openEditSplitterModal = (splitter) => {
    setCurrentItem(splitter); // Pass the whole splitter object
    setModalTitle(`Edit Splitter (Model: ${splitter.model})`);
    setModalContent('editSplitter');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
    setCurrentItem(null);
  };

  // This function will be called by all forms on success
  const handleFormSuccess = () => {
    closeModal();
    fetchHierarchy(); // Refresh the entire hierarchy list
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800">Network Hierarchy</h2>
        {/* We can add "Add Headend" here later */}
      </div>

      {loading && <p>Loading hierarchy...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="space-y-4">
        {headends.map((headend) => (
          <div key={headend.headend_id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <h3 className="text-xl font-bold text-indigo-700">{headend.name}</h3>
              {/* Add FDH button */}
              <AddButton onClick={() => openAddFdhModal(headend.headend_id)} text="Add FDH" />
            </div>
            <p className="text-sm text-gray-500">{headend.location}</p>
            
            <div className="pl-4 mt-2 space-y-2 border-l-2 border-indigo-200">
              {headend.fdhs.length === 0 && <p className="text-sm text-gray-400">No FDHs assigned.</p>}
              {headend.fdhs.map((fdh) => (
                <div key={fdh.fdh_id} className="bg-indigo-50 p-3 rounded">
                  <div className="flex items-center">
                    <h4 className="text-lg font-semibold text-indigo-600">{fdh.name}</h4>
                    {/* Edit FDH button */}
                    <EditButton onClick={() => openEditFdhModal(fdh)} />
                    {/* Add Splitter button */}
                    <AddButton onClick={() => openAddSplitterModal(fdh.fdh_id)} text="Add Splitter" />
                  </div>
                  <p className="text-sm text-gray-500">{fdh.location} (Region: {fdh.region})</p>
                  
                  <div className="pl-4 mt-2 space-y-1 border-l-2 border-green-200">
                    {fdh.splitters.length === 0 && <p className="text-sm text-gray-400">No splitters assigned.</p>}
                    {fdh.splitters.map((splitter) => (
                      <div key={splitter.splitter_id} className="bg-green-50 p-2 rounded">
                        <div className="flex items-center">
                          <h5 className="font-medium text-green-700">Splitter (Model: {splitter.model})</h5>
                          {/* Edit Splitter button */}
                          <EditButton onClick={() => openEditSplitterModal(splitter)} />
                        </div>
                        <p className="text-sm text-gray-500">Location: {splitter.location}</p>
                        <p className="text-sm text-gray-500">Capacity: {splitter.used_ports} / {splitter.port_capacity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- Modal Rendering --- */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={modalTitle}>
        {modalContent === 'addFdh' && (
          <FDHForm 
            headendId={currentItem.headend_id} 
            onSuccess={handleFormSuccess}
          />
        )}
        {modalContent === 'addSplitter' && (
          <SplitterForm 
            fdhId={currentItem.fdh_id} 
            onSuccess={handleFormSuccess} 
          />
        )}
        {modalContent === 'editFdh' && (
          <FDHEditForm 
            fdh={currentItem} 
            onSuccess={handleFormSuccess} 
            onClose={closeModal}
          />
        )}
        {modalContent === 'editSplitter' && (
          <SplitterEditForm 
            splitter={currentItem}
            fdhList={fdhList}
            onSuccess={handleFormSuccess} 
            onClose={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}