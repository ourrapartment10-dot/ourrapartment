'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building,
  Layers,
  Home,
  User,
  Phone,
  Calendar,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { useApartmentConfig } from '@/hooks/useApartmentConfig';
import { format } from 'date-fns';
import { UserRole, UserStatus } from '@/generated/client';

interface PropertyUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  image: string | null;
  createdAt: string;
}

interface Property {
  id: string;
  block: string;
  floor: string;
  flatNumber: string;
  userId: string | null;
  user: PropertyUser | null;
}

type Slot =
  | { type: 'occupied'; data: Property }
  | { type: 'vacant'; id: string };

export function PropertyGrid() {
  const {
    config,
    loading: configLoading,
    getBlockOptions,
  } = useApartmentConfig();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<Property | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  // Memoize the available blocks calculation to prevent recursion
  const availableBlocks = useMemo(() => {
    const configBlocks = getBlockOptions();
    const propBlocks = Array.from(new Set(properties.map((p) => p.block)));
    const merged = Array.from(new Set([...configBlocks, ...propBlocks]));

    return merged.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [config, properties, getBlockOptions]);

  // Handle initial block selection
  useEffect(() => {
    if (availableBlocks.length > 0 && !selectedBlock) {
      setSelectedBlock(availableBlocks[0]);
    }
  }, [availableBlocks, selectedBlock]);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/admin/properties');
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched Properties:', data);
        setProperties(data);
      }
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('DEBUG: selectedBlock:', selectedBlock);
  console.log('DEBUG: properties count:', properties.length);
  console.log(
    'DEBUG: props on current block:',
    properties.filter((p) => p.block === selectedBlock)
  );

  if (configLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!config) {
    return <div>Configuration not loaded.</div>;
  }

  const floors = Array.from({ length: config.numberOfFloors }, (_, i) =>
    (i + 1).toString()
  ).reverse(); // Top floor first? usually visual representation is bottom up but list is top down. Let's do standard list descending.

  // Helper to find property in a specific slot
  const getPropertyInSlot = (
    block: string,
    floor: string,
    unitIndex: number
  ) => {
    // Construct expected flat number logic?
    // Usually flats are Floor + Index e.g. 101, 102.
    // But user manually enters flat number.
    // We can just filter properties by block and floor and list them.

    // Wait, the requirement is "diagrammatic like a building".
    // If we strictly rely on DB flat numbers, we can just group them.
    // But if we want a grid of empty boxes, we need to assume a flat numbering scheme OR just show registered flats.

    // BETTER APPROACH:
    // Row = Floor.
    // Columns = Units (based on unitsPerFloor).
    // We need to map user's "flatNumber" to these slots? OR just display what we have.

    // If we want a strict grid:
    // We assume 3 units per floor -> display 3 boxes.
    // Property matching: We try to match properties on this floor to these boxes.
    // It's hard to guess which "box" is "101" vs "102" unless sorted.

    const propsOnFloor = properties.filter(
      (p) => p.block === block && p.floor === floor
    );

    return propsOnFloor; // Return all properties on this floor for now to just list them horizontally.
  };

  // We need to render `unitsPerFloor` empty boxes if no properties found?
  // Or render the found properties and fill the rest with "Vacant" placeholders?

  const renderFloorRow = (floor: string) => {
    const propsOnFloor = properties.filter(
      (p) => p.block === selectedBlock && p.floor === floor
    );
    // Sort by flat number
    propsOnFloor.sort((a, b) =>
      a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true })
    );

    const totalSlots = config.unitsPerFloor || 0;
    const slots: Slot[] = [];

    // Strategy: Fill slots with existing properties first.
    // If there are more slots configured than properties, add "Vacant" placeholders.
    // Note: This matches "visualizing capacity" rather than exact spatial location if we don't know flat 101 is "left" or "right".

    for (let i = 0; i < Math.max(propsOnFloor.length, totalSlots); i++) {
      if (i < propsOnFloor.length) {
        slots.push({ type: 'occupied', data: propsOnFloor[i] });
      } else {
        slots.push({ type: 'vacant', id: `vacant-${floor}-${i}` });
      }
    }

    return (
      <div
        key={floor}
        className="flex flex-col gap-4 border-b border-gray-100 p-4 transition-colors last:border-0 hover:bg-gray-50/50 md:flex-row"
      >
        <div className="flex w-24 flex-shrink-0 flex-col justify-center">
          <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">
            Floor
          </span>
          <span className="text-2xl font-black text-gray-900">{floor}</span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slots.map((slot, idx) => {
            // Determine color based on user status
            let statusColor =
              'border-emerald-200 shadow-emerald-100 hover:border-emerald-300';
            let dotColor = 'bg-emerald-500';

            if (slot.type === 'occupied' && slot.data.user) {
              if (slot.data.user.status === UserStatus.PENDING) {
                statusColor =
                  'border-purple-200 shadow-purple-100 hover:border-purple-300';
                dotColor = 'bg-purple-500';
              } else if (slot.data.user.status === UserStatus.APPROVED) {
                statusColor =
                  'border-emerald-200 shadow-emerald-100 hover:border-emerald-300';
                dotColor = 'bg-emerald-500';
              }
            }

            return (
              <motion.button
                key={slot.type === 'occupied' ? slot.data.id : slot.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  slot.type === 'occupied' && setSelectedUnit(slot.data)
                }
                className={`relative rounded-xl border p-3 text-left transition-all ${
                  slot.type === 'occupied'
                    ? `bg-white ${statusColor} group shadow-sm hover:shadow-md`
                    : 'border-dashed border-gray-100 bg-gray-50 opacity-60 hover:border-gray-300'
                } `}
              >
                {slot.type === 'occupied' ? (
                  <>
                    <div className="absolute top-0 right-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div
                        className={`${slot.data.user?.status === UserStatus.PENDING ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'} rounded-lg p-1`}
                      >
                        <Search className="h-3 w-3" />
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-gray-800">
                      {slot.data.flatNumber}
                    </h4>
                    <div className="mt-1 flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${slot.data.user ? dotColor : 'bg-amber-500'}`}
                      />
                      <p className="truncate text-xs font-bold text-gray-600">
                        {slot.data.user ? slot.data.user.name : 'Unassigned'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-2">
                    <span className="text-xs font-bold text-gray-300 uppercase">
                      Vacant
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Block Tabs */}
      <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-2">
        {availableBlocks.map((block) => (
          <button
            key={block}
            onClick={() => setSelectedBlock(block)}
            className={`rounded-2xl px-6 py-3 text-sm font-bold whitespace-nowrap transition-all ${
              selectedBlock === block
                ? 'scale-105 bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'border border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'
            } `}
          >
            Block {block}
          </button>
        ))}
      </div>

      {/* Main Visualizer */}
      <div className="min-h-[500px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/30 p-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Block {selectedBlock} Layout
            </h3>
            <p className="text-sm text-gray-500">Visual occupancy map</p>
          </div>
          <div className="flex gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              Approved
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-purple-500" />
              Pending
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-200" />
              Vacant
            </div>
          </div>
        </div>

        {properties.length > 0 &&
          properties.filter((p) => p.block === selectedBlock).length === 0 && (
            <div className="flex items-center justify-center bg-blue-50 p-4 text-sm text-blue-700">
              Note: Properties exist in other blocks (
              {properties
                .map((p) => p.block)
                .filter((v, i, a) => a.indexOf(v) === i)
                .join(', ')}
              ), but none in Block {selectedBlock}. Check your configuration if
              this is unexpected.
            </div>
          )}

        <div className="divide-y divide-gray-100">
          {floors.map((floor) => renderFloorRow(floor))}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedUnit && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm"
            onClick={() => setSelectedUnit(null)}
          >
            <motion.div
              layoutId={`unit-${selectedUnit.id}`}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-2xl"
            >
              {/* Color Bar */}
              <div
                className={`h-2 ${
                  selectedUnit.user?.status === UserStatus.PENDING
                    ? 'bg-purple-500'
                    : selectedUnit.user?.status === UserStatus.APPROVED
                      ? 'bg-emerald-500'
                      : 'bg-gray-300'
                }`}
              />

              <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl text-xl font-black text-white shadow-lg ${
                        selectedUnit.user?.status === UserStatus.PENDING
                          ? 'bg-purple-500'
                          : selectedUnit.user?.status === UserStatus.APPROVED
                            ? 'bg-emerald-500'
                            : 'bg-gray-400'
                      }`}
                    >
                      {selectedUnit.user?.image ? (
                        <img
                          src={selectedUnit.user.image}
                          alt={selectedUnit.user.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : selectedUnit.user ? (
                        selectedUnit.user.name[0]
                      ) : (
                        '?'
                      )}
                    </div>
                    <div>
                      <h2 className="mb-1 text-2xl leading-none font-black text-gray-900">
                        {selectedUnit.flatNumber}
                      </h2>
                      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Block {selectedUnit.block} • Floor {selectedUnit.floor}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUnit(null)}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {selectedUnit.user ? (
                  <div className="space-y-4">
                    <div className="border-b border-gray-50 pb-4">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {selectedUnit.user.name}
                        </h3>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[8px] font-black uppercase ${
                            selectedUnit.user.status === UserStatus.PENDING
                              ? 'border-purple-100 bg-purple-50 text-purple-600'
                              : 'border-emerald-100 bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {selectedUnit.user.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-500">
                        {selectedUnit.user.role} Member
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      <div className="group flex items-center gap-3 rounded-xl bg-gray-50/50 p-2.5 transition-colors hover:bg-gray-50">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">
                          {selectedUnit.user.phone || 'No phone'}
                        </span>
                      </div>
                      <div className="group flex items-center gap-3 rounded-xl bg-gray-50/50 p-2.5 transition-colors hover:bg-gray-50">
                        <div className="w-3.5 text-center text-[10px] font-black text-gray-400">
                          @
                        </div>
                        <span className="truncate text-xs font-bold text-gray-600">
                          {selectedUnit.user.email}
                        </span>
                      </div>
                      <div className="group flex items-center gap-3 rounded-xl bg-gray-50/50 p-2.5 transition-colors hover:bg-gray-50">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-600">
                          Joined{' '}
                          {format(
                            new Date(selectedUnit.user.createdAt),
                            'MMM d, yyyy'
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedUnit(null)}
                      className="w-full rounded-xl bg-gray-900 py-3 text-xs font-black text-white shadow-lg transition-all hover:bg-black active:scale-95"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-6 text-center">
                    <Home className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                    <p className="mb-4 text-xs font-bold text-gray-400">
                      No resident assigned
                    </p>
                    <button
                      onClick={() => setSelectedUnit(null)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-[10px] font-black text-gray-600"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
