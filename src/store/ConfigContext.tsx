import React, { createContext, useContext, useState } from 'react';
import type { KanataConfig, AliasMap, VarMap, SrcKey, LayerConfig } from '../types';

interface ConfigContextType {
  config: KanataConfig;
  setConfig: React.Dispatch<React.SetStateAction<KanataConfig>>;
  updateConfigText: (text: string) => void;
  updateSrc: (newSrc: SrcKey[]) => void;
  updateAlias: (newAlias: AliasMap[]) => void;
  updateVars: (newVars: VarMap[]) => void;
  addLayer: (name: string) => void;
  removeLayer: (index: number) => void;
  updateLayerName: (index: number, name: string) => void;
  updateLayerMapping: (layerIndex: number, srcKey: string, destKey: string) => void;
  reorderLayers: (newLayers: LayerConfig[]) => void;
  loadConfig: (newConfig: KanataConfig) => void;
  resetConfig: () => void;
  updateConfigName: (name: string) => void;
}

const defaultConfig: KanataConfig = {
  name: 'My Layout',
  config: 'process-unmapped-keys yes',
  src: ['esc', 'f1', 'f2', 'f3', 'grave', '1', '2', '3', 'tab', 'q', 'w', 'e', 'caps', 'a', 's', 'd', 'lsft', 'z', 'x', 'c'],
  vars: [],
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
  const [config, setConfig] = useState<KanataConfig>(defaultConfig);

  const updateConfigText = (text: string) => setConfig((prev) => ({ ...prev, config: text }));
  
  const updateConfigName = (name: string) => setConfig((prev) => ({ ...prev, name }));
  
  const updateSrc = (newSrc: SrcKey[]) => setConfig((prev) => ({ ...prev, src: newSrc }));
  
  const updateAlias = (newAlias: AliasMap[]) => setConfig((prev) => ({ ...prev, alias: newAlias }));
  
  const updateVars = (newVars: VarMap[]) => setConfig((prev) => ({ ...prev, vars: newVars }));
  
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

  const loadConfig = (newConfig: KanataConfig) => {
    setConfig({
      name: newConfig.name || 'Imported Layout',
      config: newConfig.config || '',
      src: newConfig.src || [],
      vars: newConfig.vars || [],
      alias: newConfig.alias || [],
      layers: newConfig.layers || []
    });
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <ConfigContext.Provider value={{
      config, setConfig, updateConfigText, updateSrc, updateAlias, updateVars, 
      addLayer, removeLayer, updateLayerName, updateLayerMapping, reorderLayers, loadConfig, resetConfig, updateConfigName
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
