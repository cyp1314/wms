### 原型图代码
```react
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  QrCode, 
  CheckCircle, 
  Printer, 
  Box, 
  Layers, 
  MapPin, 
  LogOut, 
  LogIn, 
  Search,
  AlertCircle
} from 'lucide-react';

// --- Mock Data & Constants ---

const MOCK_INBOUND_TASKS = [
  { id: 'IN-20231027-01', status: 'pending', items: 5 },
  { id: 'IN-20231027-02', status: 'processing', items: 12 },
];

const MOCK_SHELF_ITEMS = [
  { id: 'ITM-001', name: '刹车片-前左', code: 'BP-FL-001', qty: 10, targetLoc: 'A-01-02' },
  { id: 'ITM-002', name: '机油滤芯', code: 'OF-002', qty: 50, targetLoc: 'B-02-01' },
];

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon }) => {
  const baseStyle = "w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all active:scale-95 touch-manipulation";
  const variants = {
    primary: "bg-blue-600 text-white shadow-lg shadow-blue-200 active:bg-blue-700",
    success: "bg-green-600 text-white shadow-lg shadow-green-200 active:bg-green-700",
    warning: "bg-orange-500 text-white shadow-lg shadow-orange-200 active:bg-orange-600",
    secondary: "bg-white text-gray-700 border border-gray-300 shadow-sm active:bg-gray-50",
    danger: "bg-red-500 text-white active:bg-red-600",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon size={20} className="mr-2" />}
      {children}
    </button>
  );
};

const InputGroup = ({ label, value, placeholder, onChange, onScan, icon: Icon, autoFocus }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative flex shadow-sm rounded-md">
        <div className="relative flex-grow focus-within:z-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {Icon ? <Icon className="h-5 w-5 text-gray-400" /> : <QrCode className="h-5 w-5 text-gray-400" />}
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md pl-10 sm:text-sm border-gray-300 py-3 bg-white border"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus={autoFocus}
          />
        </div>
        <button
          type="button"
          onClick={onScan}
          className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        >
          <span>扫描</span>
        </button>
      </div>
    </div>
  );
};

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center relative z-10">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300
                ${index <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'}`}
            >
              {index + 1}
            </div>
            <span className={`text-xs mt-1 ${index <= currentStep ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 -mt-4 transition-colors duration-300 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {title && (
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>
    )}
    <div className="p-4">
      {children}
    </div>
  </div>
);

// --- Main Pages ---

// 1. Inbound Process
const InboundPage = ({ onBack }) => {
  const [subMode, setSubMode] = useState('menu'); // menu, sorting, shelving

  // Sorting State
  const [sortStep, setSortStep] = useState(0); // 0: Slip, 1: Trace, 2: Cart
  const [inboundSlip, setInboundSlip] = useState('');
  const [traceCode, setTraceCode] = useState('');
  const [cartNo, setCartNo] = useState('');
  const [sortLogs, setSortLogs] = useState([]);

  // Shelving State
  const [shelfStep, setShelfStep] = useState(0); // 0: Cart, 1: Goods, 2: Loc, 3: Trace
  const [shelfCart, setShelfCart] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [scannedGoods, setScannedGoods] = useState('');
  const [scannedLoc, setScannedLoc] = useState('');
  const [scannedTrace, setScannedTrace] = useState('');

  // --- Handlers for Sorting ---
  const handleSortScan = (type) => {
    // Simulating scan logic
    if (type === 'slip') {
      if (!inboundSlip) return alert("请输入入库单号");
      setSortStep(1);
    } else if (type === 'trace') {
      if (!traceCode) return alert("请确认零件号");
      setSortStep(2);
    } else if (type === 'cart') {
      if (!cartNo) return alert("请扫描台车号");
      // Complete one cycle
      const newLog = {
        id: Date.now(),
        slip: inboundSlip,
        cart: cartNo,
        time: new Date().toLocaleTimeString()
      };
      setSortLogs([newLog, ...sortLogs]);
      // Reset for next item but keep slip active? Usually reset cycle.
      setTraceCode('');
      setCartNo('');
      setSortStep(1); // Go back to scanning trace code for next item in same slip
      // Or 0 if new slip. Assuming continuous sorting for same slip:
      alert(`绑定成功！货物已关联至台车 ${cartNo}`);
    }
  };

  // --- Handlers for Shelving ---
  const handleShelfScan = (type) => {
    if (type === 'cart') {
      if (!shelfCart) return alert("请扫描台车号");
      setShelfStep(1);
      setCurrentItem(MOCK_SHELF_ITEMS[0]); // Load mock item
    } else if (type === 'goods') {
      if (scannedGoods !== currentItem.code) return alert("货物码不匹配！");
      setShelfStep(2);
    } else if (type === 'loc') {
      if (scannedLoc !== currentItem.targetLoc) return alert("货位不正确，请放入推荐货位！");
      setShelfStep(3);
    } else if (type === 'trace') {
      alert("上架成功！");
      // Reset for next item
      setScannedGoods('');
      setScannedLoc('');
      setScannedTrace('');
      setShelfStep(1);
      // In a real app, we would pop the item from the list
      setCurrentItem(MOCK_SHELF_ITEMS[1] || null);
    }
  };

  if (subMode === 'menu') {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-blue-600 text-white p-4 flex items-center shadow-md">
          <button onClick={onBack}><ArrowLeft /></button>
          <h1 className="ml-4 text-lg font-bold">入库作业</h1>
        </div>
        <div className="p-4 space-y-4">
          <div 
            onClick={() => setSubMode('sorting')}
            className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">入库分拣</h3>
                <p className="text-gray-500 text-sm">单据扫描 · 溯源 · 装车</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-300" />
          </div>

          <div 
            onClick={() => setSubMode('shelving')}
            className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 mr-4">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">台车上架</h3>
                <p className="text-gray-500 text-sm">整托/整车上架至货位</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  // --- Sorting View ---
  if (subMode === 'sorting') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center">
            <button onClick={() => setSubMode('menu')} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
            <span className="font-bold ml-2">入库分拣</span>
          </div>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">进行中</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <StepIndicator steps={['入库单', '零件号', '台车号']} currentStep={sortStep} />

          {sortStep === 0 && (
            <Card title="第一步：扫描入库单">
               <InputGroup 
                  label="入库单号" 
                  value={inboundSlip} 
                  onChange={setInboundSlip} 
                  onScan={() => { setInboundSlip('IN-20251208-01'); handleSortScan('slip'); }}
                  placeholder="扫描或输入单号"
                  autoFocus
                />
               <Button onClick={() => handleSortScan('slip')}>确认单据</Button>
            </Card>
          )}

          {sortStep >= 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm text-gray-600">当前单据</span>
                <span className="font-mono font-bold text-blue-700">{inboundSlip}</span>
              </div>

              <Card className={sortStep === 1 ? 'ring-2 ring-blue-500' : ''}>
                <InputGroup 
                  label="1. 确认零件号" 
                  value={traceCode} 
                  onChange={setTraceCode}
                  onScan={() => { setTraceCode('TR-882910'); }}
                  placeholder="扫描商品零件号"
                  autoFocus={sortStep === 1}
                  icon={QrCode}
                />
                 {sortStep === 1 && <Button onClick={() => handleSortScan('trace')}>下一步</Button>}
              </Card>

              {sortStep === 2 && (
                <Card className="animate-in fade-in slide-in-from-bottom-4 ring-2 ring-blue-500">
                  <InputGroup 
                    label="2. 扫描台车号" 
                    value={cartNo} 
                    onChange={setCartNo}
                    onScan={() => { setCartNo('C-009'); }}
                    placeholder="扫描台车条码"
                    autoFocus
                    icon={Truck}
                  />
                  <Button variant="success" onClick={() => handleSortScan('cart')}>完成绑定</Button>
                </Card>
              )}
            </div>
          )}

          {/* Log Area */}
          {sortLogs.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">最近操作</h4>
              <div className="space-y-2">
                {sortLogs.map(log => (
                  <div key={log.id} className="bg-white p-3 rounded-lg border flex justify-between items-center text-sm shadow-sm">
                    <div>
                      <div className="font-medium text-gray-800">台车: {log.cart}</div>
                      <div className="text-gray-500 text-xs">{log.slip}</div>
                    </div>
                    <span className="text-gray-400 text-xs">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Shelving View ---
  if (subMode === 'shelving') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 border-b flex items-center sticky top-0 z-20">
          <button onClick={() => setSubMode('menu')} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
          <span className="font-bold ml-2">上架作业</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {shelfStep === 0 ? (
            <div className="h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="inline-block p-6 bg-indigo-100 rounded-full text-indigo-600 mb-4">
                  <Truck size={48} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">扫描台车开始上架</h2>
                <p className="text-gray-500 mt-2">请扫描移动台车上的条码获取任务</p>
              </div>
              <InputGroup 
                label="台车号" 
                value={shelfCart}
                onChange={setShelfCart}
                onScan={() => { setShelfCart('CART-A01'); handleShelfScan('cart'); }}
                placeholder="例如: C-001"
                autoFocus
              />
              <Button onClick={() => handleShelfScan('cart')} className="mt-4">开始上架</Button>
            </div>
          ) : (
            <>
              {currentItem ? (
                <div className="space-y-4">
                  {/* Task Info Header */}
                  <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-indigo-200 text-xs uppercase">Target Location</span>
                      <span className="bg-white text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">待上架</span>
                    </div>
                    <div className="text-3xl font-mono font-bold mb-1">{currentItem.targetLoc}</div>
                    <div className="text-indigo-100 text-sm">推荐货位</div>
                  </div>

                  <Card>
                    <div className="flex items-start mb-4 pb-4 border-b border-gray-100">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <Package className="text-gray-500" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{currentItem.name}</div>
                        <div className="text-gray-500 text-sm">Code: {currentItem.code}</div>
                        <div className="text-gray-500 text-sm">Qty: {currentItem.qty} PCS</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`transition-all ${shelfStep > 1 ? 'opacity-50' : ''}`}>
                         <InputGroup 
                          label="1. 扫描入库签 (货物码)"
                          value={scannedGoods}
                          onChange={setScannedGoods}
                          onScan={() => { setScannedGoods(currentItem.code); handleShelfScan('goods'); }}
                          placeholder="确认货物"
                          autoFocus={shelfStep === 1}
                          icon={CheckCircle}
                        />
                      </div>
                      
                      {shelfStep >= 2 && (
                        <div className={`transition-all ${shelfStep > 2 ? 'opacity-50' : 'animate-in slide-in-from-bottom-2'}`}>
                           <InputGroup 
                            label="2. 扫描货位码"
                            value={scannedLoc}
                            onChange={setScannedLoc}
                            onScan={() => { setScannedLoc(currentItem.targetLoc); handleShelfScan('loc'); }}
                            placeholder="确认位置"
                            autoFocus={shelfStep === 2}
                            icon={MapPin}
                          />
                        </div>
                      )}

                       {shelfStep >= 3 && (
                        <div className="animate-in slide-in-from-bottom-2">
                           <InputGroup 
                            label="3. 扫描零件号 (零件号)"
                            value={scannedTrace}
                            onChange={setScannedTrace}
                            onScan={() => { setScannedTrace('TR-999'); handleShelfScan('trace'); }}
                            placeholder="最终确认"
                            autoFocus={shelfStep === 3}
                            icon={QrCode}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-10">
                  <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800">台车已清空</h3>
                  <p className="text-gray-500 mb-6">当前台车所有任务已完成</p>
                  <Button onClick={() => { setShelfStep(0); setShelfCart(''); }}>返回扫描下一台车</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
};

// 2. Outbound Process
const OutboundPage = ({ onBack }) => {
  const [subMode, setSubMode] = useState('menu'); // menu, picking, packing

  // Picking State
  const [pickStep, setPickStep] = useState(0); // 0: Cart, 1: Goods
  const [pickCart, setPickCart] = useState('');
  const [pickGoods, setPickGoods] = useState('');

  // Packing State
  const [packStep, setPackStep] = useState(0); 
  const [boxNo, setBoxNo] = useState('');
  const [volume, setVolume] = useState('');
  const [packGoods, setPackGoods] = useState('');
  const [packTrace, setPackTrace] = useState('');

  const handlePickScan = (type) => {
    if (type === 'cart') {
      if (!pickCart) return alert("请扫描台车");
      setPickStep(1);
    } else if (type === 'goods') {
      alert("下架成功！放入台车。");
      setPickGoods(''); // Reset for next item
    }
  };

  const handlePackScan = (type) => {
    if (type === 'box') {
      if (!boxNo) return alert("请输入或扫描箱号");
      // Simulate Printing
      alert(`箱号 ${boxNo} 标签打印中...`);
      setPackStep(1);
    } else if (type === 'volume') {
      setPackStep(2);
    } else if (type === 'goods') {
      setPackStep(3);
    } else if (type === 'trace') {
      alert("装箱校验通过！封箱。");
      setPackStep(0);
      setBoxNo('');
      setVolume('');
      setPackGoods('');
      setPackTrace('');
    }
  };

  if (subMode === 'menu') {
    return (
       <div className="flex flex-col h-full bg-slate-50">
        <div className="bg-orange-600 text-white p-4 flex items-center shadow-md">
          <button onClick={onBack}><ArrowLeft /></button>
          <h1 className="ml-4 text-lg font-bold">出库作业</h1>
        </div>
        <div className="p-4 space-y-4">
          <div 
            onClick={() => setSubMode('picking')}
            className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">下架拣货</h3>
                <p className="text-gray-500 text-sm">扫台车 · 扫商品下架</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-300" />
          </div>

          <div 
            onClick={() => setSubMode('packing')}
            className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 flex items-center justify-between active:scale-95 transition-transform"
          >
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-lg text-amber-600 mr-4">
                <Box size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">捆包复核</h3>
                <p className="text-gray-500 text-sm">扫箱号 · 打印 · 验货</p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-300" />
          </div>
        </div>
      </div>
    );
  }

  // --- Picking View ---
  if (subMode === 'picking') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 border-b flex items-center sticky top-0 z-20">
          <button onClick={() => setSubMode('menu')} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
          <span className="font-bold ml-2">下架拣货</span>
        </div>
        
        <div className="p-4 flex-1">
          <Card className="mb-4 bg-orange-50 border-orange-200">
            <div className="flex items-center text-orange-800 mb-2">
              <AlertCircle size={16} className="mr-2" />
              <span className="font-bold">任务提示</span>
            </div>
            <p className="text-sm text-orange-700">请按照指示从货架取货并放入对应台车。</p>
          </Card>

          <StepIndicator steps={['扫台车', '扫货物']} currentStep={pickStep} />

          {pickStep === 0 ? (
            <Card title="绑定拣货台车">
              <InputGroup 
                label="扫描台车码"
                value={pickCart}
                onChange={setPickCart}
                onScan={() => { setPickCart('P-CART-01'); handlePickScan('cart'); }}
                placeholder="扫描周转台车"
                autoFocus
                icon={Truck}
              />
              <Button onClick={() => handlePickScan('cart')} variant="warning">开始任务</Button>
            </Card>
          ) : (
            <Card title="商品下架扫描">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                 <div className="text-xs text-gray-500 uppercase">Current Pick</div>
                 <div className="text-xl font-bold text-gray-800">后视镜总成 (左)</div>
                 <div className="text-lg text-orange-600 font-mono">Loc: C-05-11</div>
                 <div className="mt-2 text-sm text-gray-500">Target Cart: {pickCart}</div>
              </div>

              <InputGroup 
                label="扫描货物码"
                value={pickGoods}
                onChange={setPickGoods}
                onScan={() => { setPickGoods('G-12345'); handlePickScan('goods'); }}
                placeholder="确认商品"
                autoFocus
              />
              <Button onClick={() => handlePickScan('goods')} variant="warning">确认下架</Button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // --- Packing View ---
  if (subMode === 'packing') {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 border-b flex items-center sticky top-0 z-20">
          <button onClick={() => setSubMode('menu')} className="p-2 -ml-2 text-gray-600"><ArrowLeft /></button>
          <span className="font-bold ml-2">捆包复核</span>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <StepIndicator steps={['箱号/打印', '容积', '商品', '溯源']} currentStep={packStep} />

          <div className="space-y-4">
            <Card className={packStep === 0 ? 'ring-2 ring-orange-400' : ''}>
              <InputGroup 
                label="1. 扫描箱号 [topss]"
                value={boxNo}
                onChange={setBoxNo}
                onScan={() => { setBoxNo('BOX-2023-999'); }}
                placeholder="关联包装箱"
                autoFocus={packStep === 0}
                icon={Box}
              />
               {packStep === 0 && (
                <Button onClick={() => handlePackScan('box')} variant="secondary" icon={Printer}>
                  打印箱贴 & 确认
                </Button>
               )}
            </Card>

            {packStep >= 1 && (
              <Card className={packStep === 1 ? 'animate-in fade-in slide-in-from-bottom-2 ring-2 ring-orange-400' : ''}>
                 <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">2. 录入容积 (可选)</label>
                  <input 
                    type="number" 
                    value={volume} 
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3"
                    placeholder="输入体积 m³"
                  />
                 </div>
                 {packStep === 1 && <Button onClick={() => handlePackScan('volume')} variant="warning">确认容积</Button>}
              </Card>
            )}

            {packStep >= 2 && (
              <Card className={packStep === 2 ? 'animate-in fade-in slide-in-from-bottom-2 ring-2 ring-orange-400' : ''}>
                <InputGroup 
                  label="3. 扫描出库单货物码"
                  value={packGoods}
                  onChange={setPackGoods}
                  onScan={() => { setPackGoods('OUT-G-001'); handlePackScan('goods'); }}
                  placeholder="核对商品"
                  autoFocus={packStep === 2}
                />
              </Card>
            )}

            {packStep >= 3 && (
              <Card className={packStep === 3 ? 'animate-in fade-in slide-in-from-bottom-2 ring-2 ring-orange-400' : ''}>
                <InputGroup 
                  label="4. 扫描零件号"
                  value={packTrace}
                  onChange={setPackTrace}
                  onScan={() => { setPackTrace('TR-OUT-999'); handlePackScan('trace'); }}
                  placeholder="最终溯源"
                  autoFocus={packStep === 3}
                  icon={QrCode}
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }
}

// --- App Entry ---

export default function App() {
  const [view, setView] = useState('home'); // home, inbound, outbound

  const handleNav = (target) => {
    setView(target);
  };

  if (view === 'inbound') return <InboundPage onBack={() => setView('home')} />;
  if (view === 'outbound') return <OutboundPage onBack={() => setView('home')} />;

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-gray-100 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-slate-800 text-white p-5 pt-8 pb-10 rounded-b-3xl shadow-lg relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-xs font-bold">WMS</div>
            <span className="font-semibold tracking-wide">智能仓储系统</span>
          </div>
          <div className="text-xs bg-slate-700 px-2 py-1 rounded">Online</div>
        </div>
        <h2 className="text-2xl font-bold">欢迎, 操作员 A</h2>
        <p className="text-slate-400 text-sm">请选择今日作业任务</p>
      </header>

      {/* Main Menu */}
      <main className="flex-1 p-6 -mt-6 relative z-20 space-y-6 overflow-y-auto">
        
        {/* Inbound Card */}
        <button 
          onClick={() => handleNav('inbound')}
          className="w-full bg-white rounded-2xl p-6 shadow-md border-l-8 border-blue-500 flex items-center justify-between group active:scale-95 transition-all"
        >
          <div className="flex items-center">
            <div className="bg-blue-50 p-4 rounded-xl mr-5 group-hover:bg-blue-100 transition-colors">
              <LogIn className="text-blue-600 w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800">入库作业</h3>
              <p className="text-gray-400 text-sm mt-1">打印入库单 · 分拣 · 上架</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-full p-2">
            <ArrowLeft className="rotate-180 text-gray-400" />
          </div>
        </button>

        {/* Outbound Card */}
        <button 
          onClick={() => handleNav('outbound')}
          className="w-full bg-white rounded-2xl p-6 shadow-md border-l-8 border-orange-500 flex items-center justify-between group active:scale-95 transition-all"
        >
          <div className="flex items-center">
            <div className="bg-orange-50 p-4 rounded-xl mr-5 group-hover:bg-orange-100 transition-colors">
              <LogOut className="text-orange-600 w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800">出库作业</h3>
              <p className="text-gray-400 text-sm mt-1">拣货下架 · 捆包 · 打印</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-full p-2">
            <ArrowLeft className="rotate-180 text-gray-400" />
          </div>
        </button>

        {/* Info Card */}
        <div className="bg-slate-200 rounded-xl p-4 text-center text-slate-500 text-xs">
           <p>设备 ID: PDA-0881 | v2.1.0</p>
           <p className="mt-1">Copyright © 2023 SmartWMS</p>
        </div>
      </main>
    </div>
  );
}
```