import { useState, useEffect, useCallback } from 'react';
import { BlockNamingConvention } from '@/generated/client';

export interface ApartmentConfig {
  unitsPerFloor: number;
  maxProperties: number;
  numberOfBlocks: number;
  numberOfFloors: number;
  blockNamingConvention: BlockNamingConvention;
}

export function useApartmentConfig() {
  const [config, setConfig] = useState<ApartmentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error('Failed to fetch apartment config', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getBlockOptions = useCallback(() => {
    if (!config || config.numberOfBlocks <= 0) return [];

    const options = [];
    if (config.blockNamingConvention === 'ALPHABETIC') {
      for (let i = 1; i <= config.numberOfBlocks; i++) {
        options.push(String.fromCharCode(64 + i)); // 1=A, 2=B...
      }
    } else {
      for (let i = 1; i <= config.numberOfBlocks; i++) {
        options.push(i.toString());
      }
    }
    return options;
  }, [config]);

  const getFloorOptions = useCallback(() => {
    if (!config || config.numberOfFloors <= 0) return [];
    const options = [];
    for (let i = 1; i <= config.numberOfFloors; i++) {
      options.push(i.toString());
    }
    return options;
  }, [config]);

  return { config, loading, getBlockOptions, getFloorOptions };
}
