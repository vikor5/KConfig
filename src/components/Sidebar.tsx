import React from 'react';
import { Layers, List, Settings, Plus, Trash2, Keyboard } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useConfig } from '../store/ConfigContext';

export type TabType = 'src' | 'alias' | 'config' | { type: 'layer'; index: number };

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { config, addLayer, removeLayer } = useConfig();

  const isLayerActive = (index: number) => {
    return typeof currentTab === 'object' && currentTab.type === 'layer' && currentTab.index === index;
  };

  const handleAddLayer = () => {
    const newName = `layer${config.layers.length}`;
    addLayer(newName);
    onTabChange({ type: 'layer', index: config.layers.length });
  };

  return (
    <div className={styles.sidebar}>
      <div 
        className={`${styles.navItem} ${currentTab === 'config' ? styles.active : ''}`}
        onClick={() => onTabChange('config')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={18} />
          Config
        </span>
      </div>

      <div 
        className={`${styles.navItem} ${currentTab === 'src' ? styles.active : ''}`}
        onClick={() => onTabChange('src')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Keyboard size={18} />
          SRC
        </span>
      </div>

      <div 
        className={`${styles.navItem} ${currentTab === 'alias' ? styles.active : ''}`}
        onClick={() => onTabChange('alias')}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <List size={18} />
          Alias
        </span>
      </div>

      <div className={styles.section}>
        <div className={styles.navItem} style={{ cursor: 'default' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={18} />
            Layers
          </span>
        </div>
        
        {config.layers.map((layer, idx) => (
          <div 
            key={idx} 
            className={`${styles.treeItem} ${isLayerActive(idx) ? styles.active : ''}`}
            onClick={() => onTabChange({ type: 'layer', index: idx })}
          >
            <span>{layer.name}</span>
            <button 
              className={styles.treeAction}
              onClick={(e) => {
                e.stopPropagation();
                if (config.layers.length > 1) {
                  removeLayer(idx);
                  if (isLayerActive(idx)) onTabChange('src');
                }
              }}
              title={config.layers.length === 1 ? "Cannot delete the last layer" : "Delete layer"}
              style={{ opacity: config.layers.length === 1 ? 0.3 : undefined }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        <button className={styles.addBtn} onClick={handleAddLayer}>
          <Plus size={14} />
          Add Layer
        </button>
      </div>
    </div>
  );
};
