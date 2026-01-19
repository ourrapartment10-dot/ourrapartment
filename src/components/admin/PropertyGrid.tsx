"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Layers, Home, User, Phone, Calendar, Search, Filter, X } from "lucide-react";
import { useApartmentConfig } from "@/hooks/useApartmentConfig";
import { format } from "date-fns";
import { UserRole, UserStatus } from "@/generated/client";

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
    { type: 'occupied'; data: Property }
    | { type: 'vacant'; id: string };

export function PropertyGrid() {
    const { config, loading: configLoading, getBlockOptions } = useApartmentConfig();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlock, setSelectedBlock] = useState<string>("");
    const [selectedUnit, setSelectedUnit] = useState<Property | null>(null);

    useEffect(() => {
        fetchProperties();
    }, []);

    // Memoize the available blocks calculation to prevent recursion
    const availableBlocks = useMemo(() => {
        const configBlocks = getBlockOptions();
        const propBlocks = Array.from(new Set(properties.map(p => p.block)));
        const merged = Array.from(new Set([...configBlocks, ...propBlocks]));

        return merged.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }, [config, properties, getBlockOptions]);

    // Handle initial block selection
    useEffect(() => {
        if (availableBlocks.length > 0 && !selectedBlock) {
            setSelectedBlock(availableBlocks[0]);
        }
    }, [availableBlocks, selectedBlock]);

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/admin/properties");
            if (res.ok) {
                const data = await res.json();
                console.log("Fetched Properties:", data);
                setProperties(data);
            }
        } catch (error) {
            console.error("Failed to fetch properties", error);
        } finally {
            setLoading(false);
        }
    };

    console.log("DEBUG: selectedBlock:", selectedBlock);
    console.log("DEBUG: properties count:", properties.length);
    console.log("DEBUG: props on current block:", properties.filter(p => p.block === selectedBlock));

    if (configLoading || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!config) {
        return <div>Configuration not loaded.</div>;
    }

    const floors = Array.from({ length: config.numberOfFloors }, (_, i) => (i + 1).toString()).reverse(); // Top floor first? usually visual representation is bottom up but list is top down. Let's do standard list descending.

    // Helper to find property in a specific slot
    const getPropertyInSlot = (block: string, floor: string, unitIndex: number) => {
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

        const propsOnFloor = properties.filter(p => p.block === block && p.floor === floor);

        return propsOnFloor; // Return all properties on this floor for now to just list them horizontally.
    };

    // We need to render `unitsPerFloor` empty boxes if no properties found? 
    // Or render the found properties and fill the rest with "Vacant" placeholders?

    const renderFloorRow = (floor: string) => {
        const propsOnFloor = properties.filter(p => p.block === selectedBlock && p.floor === floor);
        // Sort by flat number
        propsOnFloor.sort((a, b) => a.flatNumber.localeCompare(b.flatNumber, undefined, { numeric: true }));

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
            <div key={floor} className="flex flex-col md:flex-row gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className="w-24 flex-shrink-0 flex flex-col justify-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Floor</span>
                    <span className="text-2xl font-black text-gray-900">{floor}</span>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {slots.map((slot, idx) => {
                        // Determine color based on user status
                        let statusColor = 'border-emerald-200 shadow-emerald-100 hover:border-emerald-300';
                        let dotColor = 'bg-emerald-500';

                        if (slot.type === 'occupied' && slot.data.user) {
                            if (slot.data.user.status === UserStatus.PENDING) {
                                statusColor = 'border-purple-200 shadow-purple-100 hover:border-purple-300';
                                dotColor = 'bg-purple-500';
                            } else if (slot.data.user.status === UserStatus.APPROVED) {
                                statusColor = 'border-emerald-200 shadow-emerald-100 hover:border-emerald-300';
                                dotColor = 'bg-emerald-500';
                            }
                        }

                        return (
                            <motion.button
                                key={slot.type === 'occupied' ? slot.data.id : slot.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => slot.type === 'occupied' && setSelectedUnit(slot.data)}
                                className={`
                                relative p-3 rounded-xl border text-left transition-all
                                ${slot.type === 'occupied'
                                        ? `bg-white ${statusColor} shadow-sm hover:shadow-md group`
                                        : 'bg-gray-50 border-gray-100 border-dashed hover:border-gray-300 opacity-60'}
                            `}
                            >
                                {slot.type === 'occupied' ? (
                                    <>
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className={`${slot.data.user?.status === UserStatus.PENDING ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'} rounded-lg p-1`}>
                                                <Search className="h-3 w-3" />
                                            </div>
                                        </div>
                                        <h4 className="font-black text-lg text-gray-800">{slot.data.flatNumber}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${slot.data.user ? dotColor : 'bg-amber-500'}`} />
                                            <p className="text-xs font-bold text-gray-600 truncate">
                                                {slot.data.user ? slot.data.user.name : "Unassigned"}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-2 h-full">
                                        <span className="text-xs font-bold text-gray-300 uppercase">Vacant</span>
                                    </div>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Block Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableBlocks.map((block) => (
                    <button
                        key={block}
                        onClick={() => setSelectedBlock(block)}
                        className={`
                            px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap
                            ${selectedBlock === block
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-gray-200'}
                        `}
                    >
                        Block {block}
                    </button>
                ))}
            </div>

            {/* Main Visualizer */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Block {selectedBlock} Layout</h3>
                        <p className="text-sm text-gray-500">Visual occupancy map</p>
                    </div>
                    <div className="flex gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            Approved
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            Pending
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gray-200" />
                            Vacant
                        </div>
                    </div>
                </div>

                {properties.length > 0 && properties.filter(p => p.block === selectedBlock).length === 0 && (
                    <div className="p-4 bg-blue-50 text-blue-700 text-sm flex items-center justify-center">
                        Note: Properties exist in other blocks ({properties.map(p => p.block).filter((v, i, a) => a.indexOf(v) === i).join(", ")}), but none in Block {selectedBlock}.
                        Check your configuration if this is unexpected.
                    </div>
                )}

                <div className="divide-y divide-gray-100">
                    {floors.map(floor => renderFloorRow(floor))}
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedUnit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedUnit(null)}>
                        <motion.div
                            layoutId={`unit-${selectedUnit.id}`}
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden relative border border-gray-100"
                        >
                            {/* Color Bar */}
                            <div className={`h-2 ${selectedUnit.user?.status === UserStatus.PENDING ? 'bg-purple-500' :
                                selectedUnit.user?.status === UserStatus.APPROVED ? 'bg-emerald-500' : 'bg-gray-300'
                                }`} />

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4 items-center">
                                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg overflow-hidden ${selectedUnit.user?.status === UserStatus.PENDING ? 'bg-purple-500' :
                                            selectedUnit.user?.status === UserStatus.APPROVED ? 'bg-emerald-500' : 'bg-gray-400'
                                            }`}>
                                            {selectedUnit.user?.image ? (
                                                <img src={selectedUnit.user.image} alt={selectedUnit.user.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                                            ) : (
                                                selectedUnit.user ? selectedUnit.user.name[0] : '?'
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">{selectedUnit.flatNumber}</h2>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Block {selectedUnit.block} • Floor {selectedUnit.floor}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUnit(null)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {selectedUnit.user ? (
                                    <div className="space-y-4">
                                        <div className="pb-4 border-b border-gray-50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{selectedUnit.user.name}</h3>
                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${selectedUnit.user.status === UserStatus.PENDING ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {selectedUnit.user.status}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-gray-500">{selectedUnit.user.role} Member</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-1.5">
                                            <div className="flex items-center gap-3 p-2.5 bg-gray-50/50 rounded-xl group hover:bg-gray-50 transition-colors">
                                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600">{selectedUnit.user.phone || "No phone"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-2.5 bg-gray-50/50 rounded-xl group hover:bg-gray-50 transition-colors">
                                                <div className="text-[10px] font-black text-gray-400 w-3.5 text-center">@</div>
                                                <span className="text-xs font-bold text-gray-600 truncate">{selectedUnit.user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-3 p-2.5 bg-gray-50/50 rounded-xl group hover:bg-gray-50 transition-colors">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                <span className="text-xs font-bold text-gray-600">Joined {format(new Date(selectedUnit.user.createdAt), 'MMM d, yyyy')}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedUnit(null)}
                                            className="w-full py-3 bg-gray-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all shadow-lg active:scale-95"
                                        >
                                            Done
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                        <Home className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-gray-400 mb-4">No resident assigned</p>
                                        <button onClick={() => setSelectedUnit(null)} className="px-4 py-2 bg-white border border-gray-200 text-[10px] font-black rounded-lg text-gray-600">Dismiss</button>
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
