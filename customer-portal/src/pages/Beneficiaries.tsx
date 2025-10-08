import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Edit, Trash2, User, Building, Search } from 'lucide-react';

interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  type: 'personal' | 'business';
  nickname?: string;
  addedDate: string;
}

const Beneficiaries: React.FC = () => {
  const { t } = useLanguage();
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    type: 'personal' as 'personal' | 'business',
    nickname: ''
  });

  useEffect(() => {
    // Mock beneficiaries data - replace with actual API call
    setBeneficiaries([
      {
        id: '1',
        name: 'John Doe',
        accountNumber: '1234567890',
        bankName: 'ABC Bank',
        ifscCode: 'ABC0001234',
        type: 'personal',
        nickname: 'John',
        addedDate: '2023-01-15'
      },
      {
        id: '2',
        name: 'XYZ Corporation',
        accountNumber: '9876543210',
        bankName: 'DEF Bank',
        ifscCode: 'DEF0005678',
        type: 'business',
        addedDate: '2023-02-20'
      }
    ]);
  }, []);

  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beneficiary.accountNumber.includes(searchTerm) ||
    beneficiary.bankName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBeneficiary) {
      // Update existing beneficiary
      setBeneficiaries(prev => prev.map(b => 
        b.id === editingBeneficiary.id 
          ? { ...b, ...formData }
          : b
      ));
      setEditingBeneficiary(null);
    } else {
      // Add new beneficiary
      const newBeneficiary: Beneficiary = {
        id: Date.now().toString(),
        ...formData,
        addedDate: new Date().toISOString().split('T')[0]
      };
      setBeneficiaries(prev => [...prev, newBeneficiary]);
    }
    
    setFormData({
      name: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      type: 'personal',
      nickname: ''
    });
    setShowAddForm(false);
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setFormData({
      name: beneficiary.name,
      accountNumber: beneficiary.accountNumber,
      bankName: beneficiary.bankName,
      ifscCode: beneficiary.ifscCode,
      type: beneficiary.type,
      nickname: beneficiary.nickname || ''
    });
    setEditingBeneficiary(beneficiary);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete') || 'Are you sure you want to delete this beneficiary?')) {
      setBeneficiaries(prev => prev.filter(b => b.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      type: 'personal',
      nickname: ''
    });
    setEditingBeneficiary(null);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('beneficiaries') || 'Beneficiaries'}
        </h1>
        <p className="text-gray-600">
          {t('beneficiariesSubtitle') || 'Manage your saved recipients for quick transfers'}
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('searchBeneficiaries') || 'Search beneficiaries...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('addBeneficiary') || 'Add Beneficiary'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBeneficiary 
              ? (t('editBeneficiary') || 'Edit Beneficiary')
              : (t('addNewBeneficiary') || 'Add New Beneficiary')
            }
          </h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName') || 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('accountNumber') || 'Account Number'} *
              </label>
              <input
                type="text"
                required
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('bankName') || 'Bank Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.bankName}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('ifscCode') || 'IFSC Code'} *
              </label>
              <input
                type="text"
                required
                value={formData.ifscCode}
                onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('nickname') || 'Nickname'} ({t('optional') || 'Optional'})
              </label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('type') || 'Type'} *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'personal' | 'business' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="personal">{t('personal') || 'Personal'}</option>
                <option value="business">{t('business') || 'Business'}</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingBeneficiary ? (t('update') || 'Update') : (t('add') || 'Add')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Beneficiaries List */}
      <div className="grid gap-4">
        {filteredBeneficiaries.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('noBeneficiaries') || 'No beneficiaries found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? (t('noSearchResults') || 'No beneficiaries match your search.')
                : (t('addFirstBeneficiary') || 'Add your first beneficiary to get started.')
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('addBeneficiary') || 'Add Beneficiary'}
              </button>
            )}
          </div>
        ) : (
          filteredBeneficiaries.map((beneficiary) => (
            <div key={beneficiary.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    beneficiary.type === 'personal' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {beneficiary.type === 'personal' ? (
                      <User className={`w-6 h-6 ${beneficiary.type === 'personal' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <Building className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {beneficiary.nickname || beneficiary.name}
                    </h3>
                    {beneficiary.nickname && (
                      <p className="text-sm text-gray-600">{beneficiary.name}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {beneficiary.bankName} • {beneficiary.accountNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      {t('addedOn') || 'Added on'} {new Date(beneficiary.addedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(beneficiary)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(beneficiary.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;




