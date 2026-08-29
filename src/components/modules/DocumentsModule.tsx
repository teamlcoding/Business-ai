import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  MessageSquare, 
  Eye, 
  CheckCircle2, 
  Clock, 
  X,
  Printer,
  Sparkles,
  Send,
  Share2
} from 'lucide-react';
import { DocumentRecord, Customer, Organization } from '../../types';
import { mockDocuments, mockCustomers } from '../../data/mockData';
import { downloadPDF, sharePDFWhatsApp } from '../../utils/pdfGenerator';

interface DocumentsModuleProps {
  currentOrg?: Organization;
  isDarkMode: boolean;
}

const DOC_TYPES = [
  'GST Invoice',
  'Quotation',
  'Estimate',
  'Purchase Order',
  'Sales Order',
  'Delivery Challan',
  'Credit Note',
  'Salary Slip',
  'Offer Letter',
  'Appointment Letter',
  'Experience Letter',
  'Contracts'
] as const;

export const DocumentsModule: React.FC<DocumentsModuleProps> = ({ currentOrg, isDarkMode }) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  
  // Document Builder / Preview Modal State
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderDocType, setBuilderDocType] = useState<string>('GST Invoice');
  const [clientName, setClientName] = useState('Nexus Digital Tech Ltd');
  const [docAmount, setDocAmount] = useState(45000);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  // File Upload Attachment State
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; size: number; dataUrl: string } | null>(null);

  const loadDocuments = () => {
    if (!currentOrg?.id) return;
    const token = localStorage.getItem('businessos_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    Promise.all([
      fetch(`/api/tenant/documents?organization_id=${currentOrg.id}`, { headers }).then(res => res.ok ? res.json() : []),
      fetch(`/api/tenant/invoices?organization_id=${currentOrg.id}`, { headers }).then(res => res.ok ? res.json() : [])
    ]).then(([dbDocs, dbInvoices]) => {
      const docsList: DocumentRecord[] = [];

      if (Array.isArray(dbDocs)) {
        dbDocs.forEach((d: any) => {
          docsList.push({
            id: d.id,
            docNumber: d.docNumber || d.doc_number || `DOC-${d.id}`,
            type: d.type || 'Document',
            clientName: d.clientName || d.client_name || 'Client',
            amount: Number(d.amount || 0),
            date: d.date || new Date().toISOString().split('T')[0],
            status: d.status || 'Active',
            itemsCount: Number(d.itemsCount || 1),
            fileName: d.fileName || d.file_name,
            fileType: d.fileType || d.file_type,
            fileSize: d.fileSize || d.file_size,
            fileDataUrl: d.fileDataUrl || d.file_data_url,
          });
        });
      }

      if (Array.isArray(dbInvoices)) {
        dbInvoices.forEach((inv: any) => {
          if (!docsList.some(existing => existing.id === inv.id || existing.docNumber === inv.docNumber)) {
            docsList.push({
              id: inv.id,
              docNumber: inv.docNumber || inv.doc_number || inv.invoice_number || 'INV-001',
              type: inv.type || 'GST Invoice',
              clientName: inv.clientName || inv.client_name || inv.customer_name || 'Client',
              amount: Number(inv.amount || inv.total_amount || 0),
              date: inv.date || inv.invoice_date || '2026-08-01',
              status: (inv.status === 'Paid' || inv.payment_status === 'Paid') ? 'Paid' : 'Sent',
              itemsCount: Number(inv.itemsCount || inv.items_count || 1),
            });
          }
        });
      }

      if (docsList.length > 0) {
        setDocuments(docsList);
      }
    }).catch(err => console.error('Error loading documents:', err));
  };

  useEffect(() => {
    loadDocuments();
  }, [currentOrg?.id]);

  // WhatsApp Drawer State
  const [showWhatsAppDrawer, setShowWhatsAppDrawer] = useState(false);
  const [whatsAppRecipient, setWhatsAppRecipient] = useState('+91 98201 11223');
  const [whatsAppMsg, setWhatsAppMsg] = useState('');

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) || d.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' ? true : d.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedFile({
        name: file.name,
        type: file.type || 'application/pdf',
        size: file.size,
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const docNum = `${builderDocType.slice(0,3).toUpperCase()}-2026-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      id: `doc-${Date.now()}`,
      organization_id: currentOrg?.id || 'org-101',
      docNumber: docNum,
      type: builderDocType,
      clientName,
      amount: docAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'Sent',
      itemsCount: 1,
      fileName: uploadedFile?.name || null,
      fileType: uploadedFile?.type || null,
      fileSize: uploadedFile?.size || 0,
      fileDataUrl: uploadedFile?.dataUrl || null,
    };

    try {
      const token = localStorage.getItem('businessos_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tenant/documents', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedDoc = await res.json();
        const newDocRecord: DocumentRecord = {
          id: savedDoc.id,
          docNumber: savedDoc.docNumber || docNum,
          type: savedDoc.type || builderDocType as any,
          clientName: savedDoc.clientName || clientName,
          amount: Number(savedDoc.amount || docAmount),
          date: savedDoc.date || new Date().toISOString().split('T')[0],
          status: savedDoc.status || 'Sent',
          itemsCount: Number(savedDoc.itemsCount || 1),
          fileName: savedDoc.fileName,
          fileType: savedDoc.fileType,
          fileSize: savedDoc.fileSize,
          fileDataUrl: savedDoc.fileDataUrl,
        };
        setDocuments([newDocRecord, ...documents]);
        setShowBuilder(false);
        setUploadedFile(null);
        setPreviewDoc(newDocRecord);
      } else {
        alert('Error saving document to database.');
      }
    } catch (err: any) {
      console.error('Document save error:', err);
      // Fallback local addition
      const fallbackDoc: DocumentRecord = {
        id: payload.id,
        docNumber: docNum,
        type: builderDocType as any,
        clientName,
        amount: docAmount,
        date: payload.date,
        status: 'Sent',
        itemsCount: 1,
      };
      setDocuments([fallbackDoc, ...documents]);
      setShowBuilder(false);
      setPreviewDoc(fallbackDoc);
    }
  };

  const handleOpenWhatsApp = (doc: DocumentRecord) => {
    setPreviewDoc(doc);
    setWhatsAppMsg(`Hello ${doc.clientName}, your ${doc.type} (${doc.docNumber}) for amount ₹${doc.amount.toLocaleString()} is ready. View document: https://businessos.ai/doc/${doc.docNumber}`);
    setShowWhatsAppDrawer(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Controls & Header */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div>
          <h2 className="text-lg font-bold">Document & Invoice Studio</h2>
          <p className="text-xs text-neutral-400">Generate GST Invoices, Quotations, Orders, Salary Slips & Contracts with PDF & WhatsApp dispatch.</p>
        </div>

        <button
          onClick={() => setShowBuilder(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Document</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Document Types Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl scrollbar-none">
          <button
            onClick={() => setSelectedType('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedType === 'All' 
                ? 'bg-blue-600 text-white' 
                : isDarkMode ? 'bg-neutral-900 border border-neutral-800 text-neutral-300' : 'bg-neutral-100 border border-neutral-200 text-neutral-700'
            }`}
          >
            All Docs
          </button>
          {DOC_TYPES.slice(0, 6).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedType === type 
                  ? 'bg-blue-600 text-white' 
                  : isDarkMode ? 'bg-neutral-900 border border-neutral-800 text-neutral-300' : 'bg-neutral-100 border border-neutral-200 text-neutral-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search doc no. or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-neutral-950/60 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
          />
        </div>

      </div>

      {/* Documents Table List */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-200">
            <thead className={`border-b text-[10px] uppercase font-semibold text-neutral-400 tracking-wider ${
              isDarkMode ? 'bg-neutral-950/50 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <tr>
                <th className="p-4">Document No.</th>
                <th className="p-4">Type</th>
                <th className="p-4">Client / Employee</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-blue-500/5 transition-colors">
                  <td className="p-4 font-mono font-semibold text-blue-400">{doc.docNumber}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-[10px] font-medium text-neutral-300">
                      {doc.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{doc.clientName}</td>
                  <td className="p-4 text-neutral-400">{doc.date}</td>
                  <td className="p-4 font-bold">₹{doc.amount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      doc.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      doc.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                      title="Preview Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadPDF({
                        title: doc.type,
                        documentNumber: doc.docNumber,
                        date: doc.date,
                        organizationName: currentOrg?.name || 'BusinessOS AI Tenant',
                        organizationGstin: currentOrg?.gstin,
                        clientName: doc.clientName,
                        totalAmount: doc.amount,
                        grandTotal: doc.amount,
                        status: doc.status,
                        items: [{ description: `${doc.type} Services/Goods`, quantity: 1, unitPrice: doc.amount, amount: doc.amount }]
                      })}
                      className="p-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-colors"
                      title="Download PDF Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenWhatsApp(doc)}
                      className="p-1.5 rounded-lg bg-green-600/10 hover:bg-green-600 text-green-400 hover:text-white transition-colors"
                      title="Send via WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Document Generator Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold">Document Creator Studio</h3>
              <button onClick={() => setShowBuilder(false)} className="text-neutral-400 hover:text-neutral-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400">Document Type</label>
                <select
                  value={builderDocType}
                  onChange={(e) => setBuilderDocType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                >
                  {DOC_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400">Client / Recipient Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400">Total Value / Amount (₹)</label>
                <input
                  type="number"
                  value={docAmount}
                  onChange={(e) => setDocAmount(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400">Attach Document File (Optional - PDF/Image/Doc)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-neutral-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                />
                {uploadedFile && (
                  <p className="text-[11px] text-emerald-400 font-medium">Attached: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20"
              >
                Generate & Save Document to Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Document PDF Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-white text-neutral-900 rounded-2xl p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b pb-6">
              <div>
                <h2 className="text-xl font-black text-blue-600">APEX GLOBAL ENTERPRISES</h2>
                <p className="text-xs text-neutral-500">Suite 402, Trade Tower, Mumbai • GSTIN: 27AABCU9603R1ZM</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-neutral-800 uppercase">{previewDoc.type}</span>
                <p className="text-xs font-mono font-semibold text-blue-600">{previewDoc.docNumber}</p>
                <p className="text-[11px] text-neutral-400">Date: {previewDoc.date}</p>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="p-4 bg-neutral-50 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-neutral-400">Billed / Issued To</span>
              <p className="font-bold text-sm text-neutral-800">{previewDoc.clientName}</p>
              <p className="text-neutral-500">Status: <span className="font-semibold text-emerald-600">{previewDoc.status}</span></p>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <table className="w-full text-left text-xs">
                <thead className="border-b bg-neutral-100 text-neutral-600 uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Description</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-2">Professional Enterprise Software License & Services</td>
                    <td className="p-2 text-right">1</td>
                    <td className="p-2 text-right">₹{previewDoc.amount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t flex justify-between items-center text-xs">
              <span className="font-semibold text-neutral-500">Authorized Signature: Apex Global</span>
              <span className="text-lg font-black text-blue-600">Total: ₹{previewDoc.amount.toLocaleString()}</span>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Print Format:</span>
                <button
                  onClick={() => alert(`Switched to A4 Print Mode for ${previewDoc.docNumber}`)}
                  className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-neutral-100 hover:bg-neutral-200"
                >
                  A4 Standard
                </button>
                <button
                  onClick={() => alert(`Switched to 80mm Thermal Receipt Mode for ${previewDoc.docNumber}`)}
                  className="px-2.5 py-1 rounded-lg border text-xs font-medium bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                >
                  80mm Thermal
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadPDF({
                    title: previewDoc.type,
                    documentNumber: previewDoc.docNumber,
                    date: previewDoc.date,
                    organizationName: currentOrg?.name || 'BusinessOS AI Tenant',
                    organizationGstin: currentOrg?.gstin,
                    clientName: previewDoc.clientName,
                    totalAmount: previewDoc.amount,
                    grandTotal: previewDoc.amount,
                    status: previewDoc.status,
                    items: [{ description: `${previewDoc.type} Item / Charge`, quantity: 1, unitPrice: previewDoc.amount, amount: previewDoc.amount }]
                  })}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={() => sharePDFWhatsApp({
                    title: previewDoc.type,
                    documentNumber: previewDoc.docNumber,
                    date: previewDoc.date,
                    organizationName: currentOrg?.name || 'BusinessOS AI Tenant',
                    organizationGstin: currentOrg?.gstin,
                    clientName: previewDoc.clientName,
                    totalAmount: previewDoc.amount,
                    grandTotal: previewDoc.amount,
                    status: previewDoc.status,
                    items: [{ description: `${previewDoc.type} Item / Charge`, quantity: 1, unitPrice: previewDoc.amount, amount: previewDoc.amount }]
                  })}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Share2 className="w-4 h-4" /> Share PDF
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3.5 py-2 border rounded-xl text-xs font-semibold hover:bg-neutral-100"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* WhatsApp Direct App Launch Drawer */}
      {showWhatsAppDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className={`w-full max-w-md h-full p-6 space-y-4 shadow-2xl flex flex-col justify-between ${
            isDarkMode ? 'bg-neutral-900 border-l border-neutral-800 text-neutral-100' : 'bg-white text-neutral-900'
          }`}>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-neutral-800">
                <div className="flex items-center gap-2 text-green-400">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="text-sm font-bold">Direct WhatsApp Dispatch (No API Needed)</h3>
                </div>
                <button onClick={() => setShowWhatsAppDrawer(false)} className="text-neutral-400 hover:text-neutral-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400">
                This will open the installed WhatsApp application or WhatsApp Web with the pre-filled message. No paid API required.
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400">Customer Phone Number</label>
                <input
                  type="text"
                  value={whatsAppRecipient}
                  onChange={(e) => setWhatsAppRecipient(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none font-mono"
                  placeholder="+91 98200 12345"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400">Editable Message Content</label>
                <textarea
                  rows={6}
                  value={whatsAppMsg}
                  onChange={(e) => setWhatsAppMsg(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const cleanPhone = whatsAppRecipient.replace(/[^0-9]/g, '');
                const encodedMsg = encodeURIComponent(whatsAppMsg);
                const waUrl = cleanPhone 
                  ? `https://wa.me/${cleanPhone}?text=${encodedMsg}`
                  : `https://wa.me/?text=${encodedMsg}`;
                window.open(waUrl, '_blank');
                setShowWhatsAppDrawer(false);
              }}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
            >
              <Send className="w-4 h-4" />
              <span>Open in WhatsApp App</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
