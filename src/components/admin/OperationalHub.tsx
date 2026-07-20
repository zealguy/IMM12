/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, ShoppingBag, Hammer, Users, RefreshCw, Eye, Truck, 
  Download, FileText, CheckCircle, AlertCircle, Play, Sparkles, Send, MapPin, Trash2, Sliders, CheckSquare
} from 'lucide-react';
import { Order, RepairRequest, TradeInRequest, Product } from '../../types';
import { 
  SupplierOrder, INITIAL_SUPPLIER_ORDERS, CRMProfile, INITIAL_CRM_PROFILES 
} from './MockData';

interface OperationalHubProps {
  orders: Order[];
  repairs: RepairRequest[];
  tradeins: TradeInRequest[];
  products: Product[];
  currency: 'GHS' | 'USD';
  onUpdateOrder: (orderId: string, status: any) => Promise<Order>;
  onUpdateRepair: (repairId: string, status: any, notes: string, quoteGHS: number) => Promise<RepairRequest>;
  initialTab?: 'inventory' | 'sales' | 'repairs' | 'crm';
}

export default function OperationalHub({ 
  orders, repairs, tradeins, products, currency, onUpdateOrder, onUpdateRepair,
  initialTab = 'inventory'
}: OperationalHubProps) {
  const [operationalTab, setOperationalTab] = useState<'inventory' | 'sales' | 'repairs' | 'crm'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setOperationalTab(initialTab);
    }
  }, [initialTab]);

  // Supplier POs states
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([...INITIAL_SUPPLIER_ORDERS]);
  const [isCreatingPo, setIsCreatingPo] = useState(false);
  const [newPoSupplier, setNewPoSupplier] = useState('Apple South Africa');
  const [newPoItem, setNewPoItem] = useState('');
  const [newPoQty, setNewPoQty] = useState(10);
  const [newPoUnitCost, setNewPoUnitCost] = useState(500);

  // Invoice / Timeline states
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Repair detail/workbench states
  const [selectedRepairId, setSelectedRepairId] = useState<string | null>(null);
  const [assignedTech, setAssignedTech] = useState('Chief Technician Isaac');
  const [repairNotes, setRepairNotes] = useState('');
  const [repairQuoteGHS, setRepairQuoteGHS] = useState(0);
  const [repairStatus, setRepairStatus] = useState<any>('Pending');
  const [diagnosticSteps, setDiagnosticSteps] = useState<Record<string, boolean>>({
    'chassis': true,
    'voltage': false,
    'rf-signal': false,
    'battery-resistance': false
  });

  // CRM Dossier states
  const [crmProfiles, setCrmProfiles] = useState<CRMProfile[]>([...INITIAL_CRM_PROFILES]);
  const [selectedCrmId, setSelectedCrmId] = useState<string | null>('crm-1');

  // Action: Add restock purchase orders
  const handleDeploySupplierPo = () => {
    if (!newPoItem || !newPoSupplier) return;
    const computedTotal = newPoQty * newPoUnitCost;
    const newPo: SupplierOrder = {
      id: `po-00${supplierOrders.length + 1}`,
      supplier: newPoSupplier,
      items: [{ name: newPoItem, qty: newPoQty, unitCostGHS: newPoUnitCost }],
      totalCostGHS: computedTotal,
      status: 'Sent',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSupplierOrders([newPo, ...supplierOrders]);
    setIsCreatingPo(false);
    setNewPoItem('');
  };

  // Action: Move shipment timeline forward
  const handleAdvanceShipment = async (orderId: string, currentStatus: string) => {
    let nextStatus: any = 'Pending';
    if (currentStatus === 'Pending') nextStatus = 'Approved';
    else if (currentStatus === 'Approved') nextStatus = 'Packed';
    else if (currentStatus === 'Packed') nextStatus = 'Shipped';
    else if (currentStatus === 'Shipped') nextStatus = 'Out for Delivery';
    else if (currentStatus === 'Out for Delivery') nextStatus = 'Delivered';

    await onUpdateOrder(orderId, nextStatus);
  };

  // Action: Submit technician diagnosis update
  const handleSaveRepairDiagnostics = async (repId: string) => {
    await onUpdateRepair(repId, repairStatus, repairNotes, Number(repairQuoteGHS));
    setSelectedRepairId(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Hub Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-gray-800 rounded-2xl w-fit">
        <button
          onClick={() => setOperationalTab('inventory')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            operationalTab === 'inventory' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Inventory & Supplier POs
        </button>
        <button
          onClick={() => setOperationalTab('sales')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            operationalTab === 'sales' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Sales Timelines & Invoices
        </button>
        <button
          onClick={() => setOperationalTab('repairs')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            operationalTab === 'repairs' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Technician Diagnostics Bench
        </button>
        <button
          onClick={() => setOperationalTab('crm')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-tight transition ${
            operationalTab === 'crm' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          CRM Customer Dossiers
        </button>
      </div>

      {/* 1. INVENTORY & PO WORKSPACE */}
      {operationalTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Stock Forecasting block */}
          <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase font-mono text-gray-400 flex items-center gap-1">
                <Sparkles size={11} className="text-amber-500" />
                <span>AI Forecasting engine</span>
              </span>
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-1">Run Rate & Restock Estimator</h4>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-2">
                <div className="flex justify-between font-mono text-[10px] font-bold text-gray-400">
                  <span>VELOCITY THRESHOLD</span>
                  <span className="text-[#0066FF]">HIGH</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  **iPhone 15 Pro Max** is moving at **1.4 units/day**. Warehouse inventory of **12 units** is projected to deplete in **8 days** (expected run-out Date: **July 17**).
                </p>
                <button
                  onClick={() => {
                    setNewPoSupplier('Apple Distributor South Africa');
                    setNewPoItem('iPhone 15 Pro Max 256GB');
                    setNewPoQty(15);
                    setNewPoUnitCost(15500);
                    setIsCreatingPo(true);
                  }}
                  className="w-full py-1.5 bg-[#0066FF] hover:bg-[#0055DD] text-white rounded font-bold text-[10px] uppercase font-mono"
                >
                  Draft Restock PO
                </button>
              </div>

              <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl space-y-2">
                <div className="flex justify-between font-mono text-[10px] font-bold text-gray-400">
                  <span>VELOCITY THRESHOLD</span>
                  <span className="text-amber-500">CRITICAL LOW</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  **MacBook Pro 16"** is moving at **0.4 units/day**. Central stock of **3 units** will deplete in **7 days**. Recommended supplier purchase order trigger value: **5 units**.
                </p>
              </div>
            </div>
          </div>

          {/* Supplier PO Tracker */}
          <div className="lg:col-span-8 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-800">
              <h4 className="text-xs font-black uppercase font-mono text-gray-400">Supplier Procurement Orders</h4>
              <button
                onClick={() => setIsCreatingPo(true)}
                className="px-3 py-1 bg-amber-500 text-black rounded text-[10px] font-black uppercase font-mono"
              >
                Draft Purchase Order
              </button>
            </div>

            {/* Create PO form */}
            {isCreatingPo && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl space-y-3.5 text-xs bg-gray-50 dark:bg-black/20"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Target Supplier</label>
                    <input
                      type="text"
                      value={newPoSupplier}
                      onChange={(e) => setNewPoSupplier(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Item Name</label>
                    <input
                      type="text"
                      value={newPoItem}
                      onChange={(e) => setNewPoItem(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Quantity</label>
                    <input
                      type="number"
                      value={newPoQty}
                      onChange={(e) => setNewPoQty(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Unit Cost (GHS)</label>
                    <input
                      type="number"
                      value={newPoUnitCost}
                      onChange={(e) => setNewPoUnitCost(Number(e.target.value))}
                      className="w-full p-2 bg-white dark:bg-[#0B0B0B] border border-gray-150 dark:border-gray-800 rounded font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    onClick={() => setIsCreatingPo(false)}
                    className="px-3 py-1.5 border border-gray-150 dark:border-gray-800 rounded font-bold uppercase font-mono text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeploySupplierPo}
                    className="px-4 py-1.5 bg-emerald-500 text-black rounded font-black uppercase font-mono text-[10px]"
                  >
                    Deploy restock PO
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-3.5 max-h-60 overflow-y-auto">
              {supplierOrders.map(po => (
                <div key={po.id} className="p-3.5 border border-gray-100 dark:border-gray-900 rounded-xl bg-gray-50/50 dark:bg-black/10 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#0066FF] font-mono block">{po.id} • {po.supplier}</span>
                    <h5 className="font-extrabold text-gray-950 dark:text-white mt-1 text-xs">
                      {po.items[0].qty}x {po.items[0].name}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">Issued Date: {po.createdAt}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block text-amber-500 font-mono">GHS {po.totalCostGHS.toLocaleString()}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono mt-1 inline-block ${
                      po.status === 'Received' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SALES TIMELINES & INVOICES */}
      {operationalTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 max-h-[480px] overflow-y-auto">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Incoming Customer Orders</span>
            <div className="space-y-2">
              {orders.map(o => (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`p-3.5 border rounded-xl text-left cursor-pointer transition ${
                    selectedOrderId === o.id 
                      ? 'border-[#0066FF] bg-[#0066FF]/5' 
                      : 'border-gray-150 dark:border-gray-850 bg-gray-50/30 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{o.customerName}</h5>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{o.trackingNumber}</span>
                    </div>
                    <span className="text-amber-500 font-mono font-bold text-xs">GHS {o.totalGHS.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-3 pt-2 border-t border-gray-100 dark:border-gray-850">
                    <span>DELIVERY: {o.deliveryOption || 'Accra Dispatch'}</span>
                    <span className="uppercase text-emerald-500 font-extrabold">{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedOrderId ? (() => {
              const order = orders.find(o => o.id === selectedOrderId);
              if (!order) return null;

              const stages = ['Pending', 'Approved', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
              const currentStageIdx = stages.indexOf(order.status);

              return (
                <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-5">
                  <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">DISPATCH COORDINATION DECK</span>
                      <h4 className="text-sm font-black text-gray-950 dark:text-white mt-0.5">{order.customerName}</h4>
                      <p className="text-xs text-[#0066FF] font-mono font-bold mt-0.5">{order.trackingNumber}</p>
                    </div>
                    <button
                      onClick={() => setIsInvoiceOpen(true)}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-black/25 border border-gray-150 dark:border-gray-800 text-xs font-bold font-mono text-gray-400 hover:text-white rounded-lg flex items-center gap-1"
                    >
                      <FileText size={12} />
                      <span>Print Invoice</span>
                    </button>
                  </div>

                  {/* Shipment Tracking timeline progress nodes */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase font-mono text-gray-400 block">Workflow Progress</span>
                    <div className="flex items-center justify-between text-center relative pt-2">
                      <div className="absolute top-5 left-1 right-1 h-0.5 bg-gray-100 dark:bg-black/35 -z-10" />
                      
                      {stages.map((stg, sIdx) => {
                        const isDone = sIdx <= currentStageIdx;
                        return (
                          <div key={stg} className="space-y-2 flex-1">
                            <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold text-[9px] font-mono ${
                              isDone ? 'bg-emerald-500 text-black' : 'bg-gray-100 dark:bg-black/35 text-gray-400'
                            }`}>
                              {isDone ? '✓' : sIdx + 1}
                            </div>
                            <span className={`text-[8px] font-mono block uppercase ${isDone ? 'text-emerald-500 font-extrabold' : 'text-gray-400'}`}>
                              {stg}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-black/15 border border-gray-150 dark:border-gray-850 rounded-xl text-xs space-y-1 font-mono">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block">[SHIPPING DETAILS]</span>
                    <p className="text-gray-700 dark:text-gray-300">City: {order.city} • Address: {order.address}</p>
                    <p className="text-gray-700 dark:text-gray-300">Recipient Phone: {order.customerPhone}</p>
                    <p className="text-gray-700 dark:text-gray-300">Payment Channel: {order.paymentMethod} • Provider: {order.paymentProvider}</p>
                  </div>

                  {order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleAdvanceShipment(order.id, order.status)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase rounded-xl transition shadow-md"
                    >
                      Advance Shipment State: {stages[currentStageIdx + 1]} →
                    </button>
                  )}
                </div>
              );
            })() : (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400 font-mono bg-white dark:bg-[#121212]">
                Select an order record from the sidebar list to manage dispatch pathways.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TECHNICIAN DIAGNOSTICS WORKSPACE */}
      {operationalTab === 'repairs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 max-h-[480px] overflow-y-auto">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">Technician Repair Queue</span>
            <div className="space-y-2">
              {repairs.map(r => (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRepairId(r.id);
                    setRepairNotes(r.technicianNotes);
                    setRepairQuoteGHS(r.quotationGHS);
                    setRepairStatus(r.status);
                  }}
                  className={`p-3.5 border rounded-xl text-left cursor-pointer transition ${
                    selectedRepairId === r.id 
                      ? 'border-[#0066FF] bg-[#0066FF]/5' 
                      : 'border-gray-150 dark:border-gray-850 bg-gray-50/30 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{r.model}</h5>
                      <span className="text-[9px] font-mono text-gray-400 block mt-0.5">{r.trackingNumber}</span>
                    </div>
                    <span className="text-amber-500 font-mono font-bold text-xs">GHS {r.quotationGHS.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono mt-3 pt-2 border-t border-gray-100 dark:border-gray-850">
                    <span>FAULT: {r.faultCategory}</span>
                    <span className="uppercase text-blue-400 font-extrabold">{r.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedRepairId ? (() => {
              const repair = repairs.find(r => r.id === selectedRepairId);
              if (!repair) return null;

              return (
                <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-5">
                  <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">HARDWARE DIAGNOSTIC SUITE</span>
                      <h4 className="text-sm font-black text-gray-950 dark:text-white mt-0.5">{repair.customerName} • {repair.model}</h4>
                      <p className="text-xs text-[#0066FF] font-mono font-bold mt-0.5">{repair.trackingNumber}</p>
                    </div>
                  </div>

                  {/* Hardware Diagnostics Checklist */}
                  <div className="space-y-2 bg-gray-50 dark:bg-black/20 p-4 border border-gray-100 dark:border-gray-850 rounded-xl text-xs">
                    <span className="text-[9px] font-mono font-bold uppercase text-gray-400 block mb-2">[LAB CHECKLIST DIAGNOSTICS]</span>
                    
                    <div className="space-y-2.5">
                      {Object.entries(diagnosticSteps).map(([stepKey, val]) => (
                        <div key={stepKey} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={val}
                            onChange={() => setDiagnosticSteps(prev => ({ ...prev, [stepKey]: !prev[stepKey] }))}
                            className="rounded border-gray-300 text-[#0066FF] focus:ring-0"
                          />
                          <span className="font-mono text-gray-300 capitalize">{stepKey.replace('-', ' ')} check status</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technician fields */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Assign Lead technician</label>
                      <select
                        value={assignedTech}
                        onChange={(e) => setAssignedTech(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded text-xs"
                      >
                        <option value="Chief Technician Isaac">Chief Technician Isaac</option>
                        <option value="Senior Tech Emmanuel">Senior Tech Emmanuel</option>
                        <option value="Diagnostic Sandra">Diagnostic Sandra</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Diagnosis Quotation (GHS)</label>
                      <input
                        type="number"
                        value={repairQuoteGHS}
                        onChange={(e) => setRepairQuoteGHS(Number(e.target.value))}
                        className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Technician Lab Notes</label>
                    <textarea
                      rows={3}
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded text-xs"
                    />
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-[9px] font-bold uppercase font-mono text-gray-400">Ticket Progress Stage</label>
                    <select
                      value={repairStatus}
                      onChange={(e) => setRepairStatus(e.target.value as any)}
                      className="w-full p-2 bg-gray-50 dark:bg-black/20 border border-gray-150 dark:border-gray-800 rounded text-xs"
                    >
                      <option value="Pending">Pending (Inspection awaiting)</option>
                      <option value="In Progress">In Progress (Active soldering / panel swap)</option>
                      <option value="Awaiting Parts">Awaiting Parts (Importing OEM chips)</option>
                      <option value="Completed">Completed (Ready for collection)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleSaveRepairDiagnostics(repair.id)}
                    className="w-full py-2.5 bg-[#0066FF] hover:bg-[#0055DD] text-white font-black text-xs uppercase rounded-xl transition shadow-md"
                  >
                    Deploy Diagnostics Update
                  </button>
                </div>
              );
            })() : (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400 font-mono bg-white dark:bg-[#121212]">
                Select a repair ticket from the workbench queue to log panel repairs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CRM DOSSIERS */}
      {operationalTab === 'crm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 space-y-4 max-h-[480px] overflow-y-auto">
            <span className="text-[10px] font-black uppercase font-mono text-gray-400">High-Value Clientele profiles</span>
            <div className="space-y-2">
              {crmProfiles.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedCrmId(p.id)}
                  className={`p-3 border rounded-xl text-left cursor-pointer transition ${
                    selectedCrmId === p.id 
                      ? 'border-[#0066FF] bg-[#0066FF]/5' 
                      : 'border-gray-150 dark:border-gray-850 bg-gray-50/30 hover:border-gray-300'
                  }`}
                >
                  <h5 className="font-extrabold text-xs text-gray-900 dark:text-white">{p.name}</h5>
                  <span className="text-[10px] text-gray-400 block">{p.city} Metropolis</span>
                  <div className="flex justify-between items-center text-[9px] font-mono mt-2 text-gray-400">
                    <span>LTV: GHS {p.totalSpentGHS.toLocaleString()}</span>
                    <span className="text-emerald-400 font-bold">{p.loyaltyPoints} PTS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedCrmId ? (() => {
              const profile = crmProfiles.find(p => p.id === selectedCrmId);
              if (!profile) return null;

              return (
                <div className="bg-white dark:bg-[#121212] border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-5">
                  <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-800/80 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">CLIENT ACCOUNTS DOSSIER</span>
                      <h4 className="text-base font-black text-gray-950 dark:text-white mt-0.5">{profile.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{profile.email} • {profile.phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-500 font-mono font-black text-base">{profile.loyaltyPoints} PTS</span>
                      <span className="text-[9px] font-mono text-gray-400 block uppercase">Loyalty Tier Balance</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 dark:bg-black/25 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[9px] font-mono uppercase text-gray-400 block">Total Ledger Intake</span>
                      <span className="text-xs font-mono font-black text-gray-800 dark:text-white mt-1 block">GHS {profile.totalSpentGHS.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/25 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[9px] font-mono uppercase text-gray-400 block">Active Devices list</span>
                      <span className="text-xs font-mono font-black text-gray-800 dark:text-white mt-1 block">{profile.registeredDevices.length} registered</span>
                    </div>
                    <div className="bg-gray-50 dark:bg-black/25 p-3 rounded-xl border border-gray-100 dark:border-gray-850">
                      <span className="text-[9px] font-mono uppercase text-gray-400 block">Diagnostic Tickets</span>
                      <span className="text-xs font-mono font-black text-gray-800 dark:text-white mt-1 block">{profile.repairTicketsCount} logged</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase font-mono text-gray-400 block">Communication Dispatch Logs</span>
                    <div className="space-y-2 max-h-36 overflow-y-auto font-mono text-[11px]">
                      {profile.communicationHistory.map((comm, idx) => (
                        <div key={idx} className="p-2.5 bg-gray-50/50 dark:bg-black/15 border border-gray-100 dark:border-gray-900 rounded-lg flex items-start gap-3">
                          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded font-bold uppercase">{comm.type}</span>
                          <div className="flex-1">
                            <p className="text-gray-700 dark:text-gray-300 leading-normal">{comm.text}</p>
                            <span className="text-[8px] text-gray-400 mt-1 block">DISPATCH DATE: {comm.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-xs text-gray-400 font-mono bg-white dark:bg-[#121212]">
                Select a customer profile record to view CRM logs.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Beautiful printable A4 Invoice template popup overlay */}
      <AnimatePresence>
        {isInvoiceOpen && selectedOrderId && (() => {
          const order = orders.find(o => o.id === selectedOrderId);
          if (!order) return null;

          return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white text-black p-8 rounded-2xl w-full max-w-2xl space-y-6 shadow-2xl font-sans"
              >
                {/* Printable Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-5">
                  <div>
                    <h2 className="text-xl font-black tracking-tighter">IMMORTAL ELECTRONICS</h2>
                    <p className="text-xs text-gray-400 uppercase font-mono mt-0.5">Accra Central Workshop, Ghana</p>
                    <p className="text-xs text-gray-400 font-mono">TEL: +233 24 123 4567 • info@immortalelectronics.com</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-base font-extrabold text-gray-900">COMMERCIAL INVOICE</h3>
                    <p className="text-xs font-mono text-gray-400 mt-0.5">REF: {order.trackingNumber}</p>
                    <p className="text-xs font-mono text-gray-400">DATE: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h5 className="font-extrabold text-gray-400 uppercase font-mono mb-1">BILLING CLIENT TO:</h5>
                    <p className="font-extrabold text-gray-800">{order.customerName}</p>
                    <p className="text-gray-500">{order.customerPhone}</p>
                    <p className="text-gray-500">{order.customerEmail}</p>
                  </div>
                  <div className="text-right">
                    <h5 className="font-extrabold text-gray-400 uppercase font-mono mb-1">SHIPPING DESTINATION:</h5>
                    <p className="text-gray-500">{order.city}</p>
                    <p className="text-gray-500">{order.address}</p>
                    <p className="text-gray-500">Method: {order.deliveryOption || 'Dispatch Rider'}</p>
                  </div>
                </div>

                {/* Items breakdown list */}
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-150 border-b border-gray-300 font-bold uppercase font-mono text-gray-500">
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Extended Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((it: any, i: number) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="p-2.5 font-bold text-gray-800">{it.product.name}</td>
                        <td className="p-2.5 text-center font-mono">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono">GHS {it.product.priceGHS.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-mono font-bold">GHS {(it.product.priceGHS * it.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals math including VAT */}
                <div className="flex justify-end pt-3">
                  <div className="w-64 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">SUBTOTAL</span>
                      <span className="font-bold">GHS {(order.totalGHS - (order.deliveryCostGHS || 0) - Math.round(order.totalGHS * 0.15)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GHANA VAT & LEVIES (21.9%)</span>
                      <span className="font-bold">GHS {Math.round(order.totalGHS * 0.15).toLocaleString()}</span>
                    </div>
                    {order.deliveryCostGHS && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">COURIER FEE</span>
                        <span className="font-bold">GHS {order.deliveryCostGHS}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-gray-300 pt-2 text-sm">
                      <span className="font-black text-gray-800">TOTAL DUE (GHS)</span>
                      <span className="font-black text-[#0066FF] text-right">GHS {order.totalGHS.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>EQUIVALENT USD</span>
                      <span>${(order.totalUSD || Math.round(order.totalGHS / 14.5)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Footer seal */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                  <div>
                    <span className="font-bold uppercase text-[#0066FF]">[MOMO PAYMENT AUTHORIZED]</span>
                    <p className="mt-0.5">REFERENCE: {order.id.toUpperCase()}-TXN-MOMO</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black font-bold uppercase rounded font-mono"
                    >
                      Print Form
                    </button>
                    <button
                      onClick={() => setIsInvoiceOpen(false)}
                      className="px-4 py-1.5 bg-[#0066FF] text-white font-black uppercase rounded font-mono"
                    >
                      Close Deck
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
