import { useState, useEffect, useRef } from 'react';

const PIN = '1234';

const initialItems = [
  { name: 'Milk', price: 60, quantity: 2, createdAt: new Date(Date.now() - 0 * 864e5).toISOString() },
  { name: 'Bread', price: 45, quantity: 1, createdAt: new Date(Date.now() - 0 * 864e5).toISOString() },
  { name: 'Eggs', price: 84, quantity: 12, createdAt: new Date(Date.now() - 1 * 864e5).toISOString() },
  { name: 'Basmati Rice', price: 420, quantity: 1, createdAt: new Date(Date.now() - 1 * 864e5).toISOString() },
];

const fmt = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');

function when(date) {
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 864e5);
  return d < 1 ? 'Added today' : d < 2 ? 'Added yesterday' : `Added ${d} days ago`;
}

export default function App() {
  const [budget, setBudget] = useState(2000);
  const [items, setItems] = useState([]);
  const [newId, setNewId] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');

  const [delTarget, setDelTarget] = useState(null);
  const [pinVal, setPinVal] = useState('');
  const [pinErr, setPinErr] = useState('');

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState('2000');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const nameInputRef = useRef(null);
  const pinInputRef = useRef(null);
  const budgetInputRef = useRef(null);

  const loadData = async () => {
    try {
      const [budgetRes, itemsRes] = await Promise.all([
        fetch('/api/budget'),
        fetch('/api/items')
      ]);

      let curBudget = 2000;
      if (budgetRes.ok) {
        const bData = await budgetRes.json();
        if (bData?.data?.amount !== undefined && bData?.data?.amount > 0) {
          curBudget = bData.data.amount;
          setBudget(curBudget);
        } else {
          await fetch('/api/budget', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 2000 })
          });
          setBudget(2000);
        }
      }

      if (itemsRes.ok) {
        const iData = await itemsRes.json();
        if (Array.isArray(iData.data) && iData.data.length > 0) {
          setItems(iData.data);
        } else {
          const seeded = [];
          for (const item of initialItems) {
            const res = await fetch('/api/items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            });
            if (res.ok) {
              const resJson = await res.json();
              if (resJson?.data) seeded.push(resJson.data);
            }
          }
          if (seeded.length > 0) {
            setItems(seeded);
          } else {
            setItems(initialItems.map((it, idx) => ({ ...it, _id: String(idx + 1) })));
          }
        }
      }
    } catch {
      setBudget(2000);
      setItems(initialItems.map((it, idx) => ({ ...it, _id: String(idx + 1) })));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const spent = items.reduce((s, i) => s + (Number(i.price) || 0), 0);
  const rem = budget - spent;
  const pct = budget ? (spent / budget) * 100 : 0;
  const over = rem < 0;

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const cleanName = name.trim();
    const numPrice = Number(price);
    const numQty = Number(qty) || 1;

    if (!cleanName || isNaN(numPrice) || numPrice < 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          price: numPrice,
          quantity: numQty
        })
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.data;
        setItems((prev) => [created, ...prev]);
        setNewId(created._id || created.id);
        setName('');
        setPrice('');
        setQty('');
      } else {
        const fallback = {
          _id: String(Date.now()),
          name: cleanName,
          price: numPrice,
          quantity: numQty,
          createdAt: new Date().toISOString()
        };
        setItems((prev) => [fallback, ...prev]);
        setNewId(fallback._id);
        setName('');
        setPrice('');
        setQty('');
      }
    } catch {
      const fallback = {
        _id: String(Date.now()),
        name: cleanName,
        price: numPrice,
        quantity: numQty,
        createdAt: new Date().toISOString()
      };
      setItems((prev) => [fallback, ...prev]);
      setNewId(fallback._id);
      setName('');
      setPrice('');
      setQty('');
    } finally {
      setIsSubmitting(false);
      nameInputRef.current?.focus();
    }
  };

  const openDeleteModal = (item) => {
    setDelTarget(item);
    setPinVal('');
    setPinErr('');
    setTimeout(() => pinInputRef.current?.focus(), 100);
  };

  const closeDeleteModal = () => {
    setDelTarget(null);
    setPinVal('');
    setPinErr('');
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    if (pinVal !== PIN) {
      setPinErr('Incorrect PIN. Try again.');
      setPinVal('');
      pinInputRef.current?.focus();
      return;
    }

    if (!delTarget) return;

    const id = delTarget._id || delTarget.id;
    setIsDeleting(true);
    try {
      await fetch(`/api/items/${id}`, { method: 'DELETE' });
    } catch {} finally {
      setIsDeleting(false);
    }

    setItems((prev) => prev.filter((i) => (i._id || i.id) !== id));
    closeDeleteModal();
  };

  const openBudgetModal = () => {
    setBudgetInput(String(budget));
    setBudgetModalOpen(true);
    setTimeout(() => budgetInputRef.current?.select(), 100);
  };

  const closeBudgetModal = () => {
    setBudgetModalOpen(false);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (isSavingBudget) return;

    const val = Number(budgetInput);
    if (isNaN(val) || val < 0) return;

    setIsSavingBudget(true);
    try {
      await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: val })
      });
    } catch {} finally {
      setIsSavingBudget(false);
    }

    setBudget(val);
    closeBudgetModal();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeDeleteModal();
        closeBudgetModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <main className="max-w-[960px] mx-auto px-5 sm:px-8 py-10 sm:py-16 pb-36 sm:pb-16">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <h1 className="text-[32px] sm:text-[40px] font-semibold tracking-[-0.035em] leading-none">
              Shopping List
            </h1>
            <p className="mt-3 text-[15px] text-neutral-500">
              Keep track of what you need and stay within your budget.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">Budget:</span>
            <span id="budgetLbl" className="num text-[17px] font-semibold">
              {fmt(budget)}
            </span>
            <button className="btn btn-ghost" onClick={openBudgetModal}>
              Edit
            </button>
          </div>
        </header>

        {over && (
          <div id="warn" className="warn p-5 sm:p-6 mb-6 flex gap-4 enter">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000"
              strokeWidth="1.8"
              className="shrink-0 mt-0.5"
            >
              <path d="M12 3 2 20h20L12 3z" />
              <path d="M12 10v4M12 17v.5" />
            </svg>
            <div>
              <p className="font-semibold text-[16px]">Budget exceeded</p>
              <p id="warnTxt" className="mt-1.5 text-[14px] text-neutral-600 leading-relaxed">
                You've spent <b className="text-black num">{fmt(spent)}</b> against a {fmt(budget)} budget.
                <br />
                You're <b className="text-black num">{fmt(-rem)}</b> over your limit.
              </p>
            </div>
          </div>
        )}

        <section className="card p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-0 sm:divide-x divide-neutral-100">
            <div className="sm:pr-8">
              <p className="label">Total spent</p>
              <p id="sSpent" className="num mt-3 text-[22px] sm:text-[34px] font-semibold">
                {fmt(spent)}
              </p>
            </div>
            <div className="sm:px-8">
              <p className="label" id="sRemLbl">
                {over ? 'Over budget' : 'Remaining'}
              </p>
              <p id="sRem" className="num mt-3 text-[22px] sm:text-[34px] font-semibold">
                {over ? '−' + fmt(-rem) : fmt(rem)}
              </p>
            </div>
            <div className="sm:pl-8">
              <p className="label">Items</p>
              <p id="sItems" className="num mt-3 text-[22px] sm:text-[34px] font-semibold">
                {items.length}
              </p>
            </div>
          </div>
          <div className="mt-8">
            <div id="track" className={`track${over ? ' over' : pct >= 80 ? ' near' : ''}`}>
              <div id="bar" className="bar" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <div className="flex justify-between mt-3 text-[13px]">
              <span id="pct" className="text-neutral-600">
                {Math.round(pct)}% of budget used
              </span>
              <span
                id="status"
                className={over ? 'text-black font-medium' : 'text-neutral-400'}
              >
                {over ? 'Over limit' : pct >= 80 ? 'Approaching limit' : 'On track'}
              </span>
            </div>
          </div>
        </section>

        <section className="card p-6 sm:p-8 mb-6">
          <form
            id="addForm"
            onSubmit={handleAddItem}
            className="grid grid-cols-1 sm:grid-cols-[1fr_130px_90px_auto] gap-4 sm:items-end"
          >
            <label className="block">
              <span className="block text-[13px] font-medium mb-2">What do you need?</span>
              <input
                ref={nameInputRef}
                id="iName"
                className="field"
                placeholder="Milk"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="off"
              />
            </label>
            <label className="block">
              <span className="block text-[13px] font-medium mb-2">Price</span>
              <div className="prefix">
                <span>₹</span>
                <input
                  id="iPrice"
                  className="field num"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="60"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="block text-[13px] font-medium mb-2">
                Qty <span className="text-neutral-400 font-normal">optional</span>
              </span>
              <input
                id="iQty"
                className="field num"
                type="number"
                min="1"
                step="1"
                placeholder="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                disabled={isSubmitting}
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-dark w-full sm:w-auto !h-[48px] sm:!h-[46px]"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" /> Adding...
                </>
              ) : (
                <>
                  <span className="text-lg leading-none">+</span> Add Item
                </>
              )}
            </button>
          </form>
        </section>

        <section className="card p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[17px] font-semibold tracking-tight">Your Items</h2>
            <span className="text-[13px] text-neutral-400">Deletion is PIN-protected</span>
          </div>

          <div id="list">
            {items.map((i) => {
              const itemId = i._id || i.id;
              const quantity = i.quantity || i.qty || 1;
              return (
                <div
                  key={itemId}
                  className={`row ${itemId === newId ? 'enter' : ''}`}
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium truncate">
                      {i.name}
                      {quantity > 1 && (
                        <span className="text-neutral-400 font-normal">
                          {' '}× {quantity}
                        </span>
                      )}
                    </p>
                    <p className="text-[13px] text-neutral-400 mt-1">
                      {when(i.createdAt || i.t || Date.now())}
                    </p>
                  </div>
                  <p className="num text-[15px] font-medium">{fmt(i.price)}</p>
                  <button
                    className="lock"
                    title="Delete (PIN required)"
                    onClick={() => openDeleteModal(i)}
                  >
                    <svg
                      className="closed"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <svg
                      className="open"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div id="empty" className="text-center py-16">
              <p className="font-semibold text-[16px]">Your shopping list is empty.</p>
              <p className="mt-2 text-[14px] text-neutral-500 leading-relaxed">
                Add your first item to start tracking
                <br />
                your spending.
              </p>
              <button
                className="btn btn-dark mt-6"
                onClick={() => nameInputRef.current?.focus()}
              >
                <span className="text-lg leading-none">+</span> Add Item
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div id="totalBlock" className="mt-4 pt-6 border-t border-black">
              <div className="flex items-end justify-between">
                <span className="label !text-black">Total spent</span>
                <span
                  id="tSpent"
                  className="num text-[40px] sm:text-[52px] font-semibold leading-none tracking-[-0.04em]"
                >
                  {fmt(spent)}
                </span>
              </div>
              <div className="flex justify-between mt-4 text-[15px]">
                <span id="tRemLbl" className="text-neutral-500">
                  {over ? 'Over budget' : 'Remaining'}
                </span>
                <span id="tRem" className="num font-medium">
                  {over ? '−' + fmt(-rem) : fmt(rem)}
                </span>
              </div>
            </div>
          )}
        </section>

      </main>

      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 px-5 py-4 z-40 flex items-center justify-between">
        <div>
          <p className="label">Total spent</p>
          <p id="mRem" className="text-[12px] text-neutral-500 mt-1">
            {over ? fmt(-rem) + ' over budget' : fmt(rem) + ' remaining'}
          </p>
        </div>
        <p id="mSpent" className="num text-[30px] font-semibold tracking-[-0.04em]">
          {fmt(spent)}
        </p>
      </div>

      <div
        id="delOv"
        className={`overlay ${delTarget ? 'show' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeDeleteModal();
        }}
      >
        <div className="modal card w-full max-w-[380px] p-7 shadow-[0_20px_60px_rgba(0,0,0,.12)]">
          <p className="text-[18px] font-semibold tracking-tight">Delete this item?</p>
          <p className="mt-2 text-[14px] text-neutral-500">
            <span id="delName" className="text-black font-medium">
              {delTarget?.name}
            </span>{' '}
            will be removed. Enter your PIN to confirm.
          </p>
          <input
            ref={pinInputRef}
            id="pin"
            className="field num mt-5 text-center tracking-[.6em]"
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="••••"
            value={pinVal}
            onChange={(e) => setPinVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleConfirmDelete();
            }}
          />
          <p id="pinErr" className="text-[12px] mt-2 h-4 text-neutral-600">
            {pinErr}
          </p>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              className="btn btn-ghost !h-[46px]"
              onClick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-dark !px-3"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner" /> Deleting...
                </>
              ) : (
                'Confirm Delete'
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        id="budOv"
        className={`overlay ${budgetModalOpen ? 'show' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeBudgetModal();
        }}
      >
        <form
          className="modal card w-full max-w-[380px] p-7 shadow-[0_20px_60px_rgba(0,0,0,.12)]"
          onSubmit={handleSaveBudget}
        >
          <p className="text-[18px] font-semibold tracking-tight">Edit budget</p>
          <p className="mt-2 text-[14px] text-neutral-500">
            Set how much you plan to spend.
          </p>
          <div className="prefix mt-5">
            <span>₹</span>
            <input
              ref={budgetInputRef}
              id="bIn"
              className="field num"
              type="number"
              min="1"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              className="btn btn-ghost !h-[46px]"
              onClick={closeBudgetModal}
              disabled={isSavingBudget}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-dark"
              disabled={isSavingBudget}
            >
              {isSavingBudget ? (
                <>
                  <span className="spinner" /> Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
