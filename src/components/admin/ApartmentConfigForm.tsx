'use client';

import { useState, useEffect } from 'react';
import { Building, Layers, Home, Save, Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export function ApartmentConfigForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [config, setConfig] = useState({
    maxProperties: 0,
    numberOfBlocks: 0,
    numberOfFloors: 0,
    unitsPerFloor: 0,
    blockNamingConvention: 'NUMERIC',
    blockInput: '0', // For local display/logic
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data) {
        const isAlpha = data.blockNamingConvention === 'ALPHABET';
        let derivedBlockInput = data.numberOfBlocks.toString();
        if (isAlpha && data.numberOfBlocks > 0) {
          // Convert count to letter (1=A, 2=B)
          derivedBlockInput = String.fromCharCode(64 + data.numberOfBlocks);
        }

        setConfig({
          maxProperties: data.maxProperties || 0,
          numberOfBlocks: data.numberOfBlocks || 0,
          numberOfFloors: data.numberOfFloors || 0,
          unitsPerFloor: data.unitsPerFloor || 0,
          blockNamingConvention: data.blockNamingConvention || 'NUMERIC',
          blockInput: derivedBlockInput,
        });
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save configuration');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Building className="h-5 w-5 text-gray-500" />
            Community Configuration
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Global limits and structure setup for the community.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Home className="h-4 w-4" />
              Max Residents/Properties
            </label>
            <input
              type="number"
              value={config.maxProperties}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxProperties: parseInt(e.target.value) || 0,
                })
              }
              className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-900 transition-all focus:ring-2"
              placeholder="e.g. 50"
            />
            <p className="text-[10px] text-gray-400">
              Total number of units allowed in this community.
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Building className="h-4 w-4" />
              Blocks / Last Block
            </label>
            <input
              type="text"
              value={config.blockInput}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                let convention = 'NUMERIC';
                let count = 0;

                if (/^\d+$/.test(val)) {
                  count = parseInt(val);
                  convention = 'NUMERIC';
                } else if (/^[A-Z]$/.test(val)) {
                  count = val.charCodeAt(0) - 64;
                  convention = 'ALPHABET';
                }

                setConfig({
                  ...config,
                  blockInput: val,
                  numberOfBlocks: count,
                  blockNamingConvention: convention,
                });
              }}
              className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-900 transition-all focus:ring-2"
              placeholder="e.g. 5 or E"
            />
            <p className="text-[10px] text-gray-400">
              Enter Number (e.g. 5) or Letter (e.g. E = 5 blocks).
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Layers className="h-4 w-4" />
              Floors per Block
            </label>
            <input
              type="number"
              value={config.numberOfFloors}
              onChange={(e) =>
                setConfig({
                  ...config,
                  numberOfFloors: parseInt(e.target.value) || 0,
                })
              }
              className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-900 transition-all focus:ring-2"
              placeholder="e.g. 5"
            />
            <p className="text-[10px] text-gray-400">
              Average number of floors in each block.
            </p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Home className="h-4 w-4" />
              Units per Floor
            </label>
            <input
              type="number"
              value={config.unitsPerFloor}
              onChange={(e) =>
                setConfig({
                  ...config,
                  unitsPerFloor: parseInt(e.target.value) || 0,
                })
              }
              className="focus:ring-primary/20 focus:border-primary w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 font-medium text-gray-900 transition-all focus:ring-2"
              placeholder="e.g. 4"
            />
            <p className="text-[10px] text-gray-400">
              Number of flats on each floor.
            </p>
          </div>
        </div>

        <div className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm text-emerald-800">
            These settings define the structure of your visual property
            dashboard. Setting a limit of{' '}
            <strong>{config.maxProperties || '0'}</strong> properties will
            prevent registration once reached.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-primary flex items-center gap-2 rounded-xl px-6 py-2.5 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : success ? (
            'Saved Successfully!'
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Configuration
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
