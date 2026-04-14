import React, { createContext, useContext, useState } from 'react';
import type { KMonadConfig, AliasMap, SrcKey, LayerConfig } from '../types';

interface ConfigContextType {
  config: KMonadConfig;
  setConfig: React.Dispatch<React.SetStateAction<KMonadConfig>>;
  updateConfigText: (text: string) => void;
  updateSrc: (newSrc: SrcKey[]) => void;
  updateAlias: (newAlias: AliasMap[]) => void;
  addLayer: (name: string) => void;
  removeLayer: (index: number) => void;
  updateLayerName: (index: number, name: string) => void;
  updateLayerMapping: (layerIndex: number, srcKey: string, destKey: string) => void;
  reorderLayers: (newLayers: LayerConfig[]) => void;
  loadConfig: (newConfig: KMonadConfig) => void;
}

const defaultConfig: KMonadConfig = {
  config: 'input  (device-file "/dev/input/by-id/usb-0000_0000-event-kbd")\noutput (uinput-sink "My KMonad output")\nfallthrough true',
  src: ['esc', 'f1', 'f2', 'f3', 'grave', '1', '2', '3', 'tab', 'q', 'w', 'e', 'caps', 'a', 's', 'd', 'lsft', 'z', 'x', 'c'],
  alias: [],
  layers: [
    {
      name: 'base',
      mappings: []
    }
  ],
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<KMonadConfig>(defaultConfig);

  const updateConfigText = (text: string) => setConfig((prev) => ({ ...prev, config: text }));
  
  const updateSrc = (newSrc: SrcKey[]) => setConfig((prev) => ({ ...prev, src: newSrc }));
  
  const updateAlias = (newAlias: AliasMap[]) => setConfig((prev) => ({ ...prev, alias: newAlias }));
  
  const addLayer = (name: string) => {
    setConfig((prev) => ({
      ...prev,
      layers: [...prev.layers, { name, mappings: [] }]
    }));
  };

  const removeLayer = (index: number) => {
    setConfig((prev) => {
      const newLayers = [...prev.layers];
      newLayers.splice(index, 1);
      return { ...prev, layers: newLayers };
    });
  };

  const updateLayerName = (index: number, name: string) => {
    setConfig((prev) => {
      const newLayers = [...prev.layers];
      newLayers[index].name = name;
      return { ...prev, layers: newLayers };
    });
  };

  const updateLayerMapping = (layerIndex: number, srcKey: string, destKey: string) => {
    setConfig((prev) => {
      const newLayers = [...prev.layers];
      const layer = newLayers[layerIndex];
      const mappingIndex = layer.mappings.findIndex((m) => m.src === srcKey);
      
      if (mappingIndex !== -1) {
        layer.mappings[mappingIndex].dest = destKey;
      } else {
        layer.mappings.push({ src: srcKey, dest: destKey });
      }
      
      return { ...prev, layers: newLayers };
    });
  };

  const reorderLayers = (newLayers: LayerConfig[]) => {
    setConfig((prev) => ({ ...prev, layers: newLayers }));
  };

  const loadConfig = (newConfig: KMonadConfig) => {
    setConfig({
      config: newConfig.config || '',
      src: newConfig.src || [],
      alias: newConfig.alias || [],
      layers: newConfig.layers || []
    });
  };

  return (
    <ConfigContext.Provider value={{
      config, setConfig, updateConfigText, updateSrc, updateAlias, 
      addLayer, removeLayer, updateLayerName, updateLayerMapping, reorderLayers, loadConfig
    }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
