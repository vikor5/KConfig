import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, FileCode2, Trash2 } from 'lucide-react';
import { ConfigProvider, useConfig } from './store/ConfigContext';
import { Sidebar, type TabType } from './components/Sidebar';
import { SrcTab } from './components/SrcTab';
import { AliasTab } from './components/AliasTab';
import { ConfigTab } from './components/ConfigTab';
import { LayerTab } from './components/LayerTab';
import { exportToKConfig, exportToKbd, importFromKConfig } from './utils/export';
import styles from './App.module.css';
import './index.css';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('config');
  const { config, loadConfig, resetConfig, updateConfigName } = useConfig();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(config.name || 'My Layout');

  useEffect(() => {
    setTempName(config.name || 'My Layout');
  }, [config.name]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderContent = () => {
    if (currentTab === 'config') return <ConfigTab />;
    if (currentTab === 'src') return <SrcTab />;
    if (currentTab === 'alias') return <AliasTab />;
    if (typeof currentTab === 'object' && currentTab.type === 'layer') {
      return <LayerTab layerIndex={currentTab.index} />;
    }
    return <div>Select a tab</div>;
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importFromKConfig(
        file,
        (importedConfig) => {
          loadConfig(importedConfig);
          if (fileInputRef.current) fileInputRef.current.value = '';
        },
        (errorMsg) => {
          alert(errorMsg);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      );
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all configurations to default? This cannot be undone.')) {
      resetConfig();
      setCurrentTab('config');
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.titleContainer}>
          <div className={styles.title}>
            <FileCode2 className={styles.icon} size={28} />
            KConfig
          </div>
          <div className={styles.nameSeparator}>/</div>
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                updateConfigName(tempName);
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateConfigName(tempName);
                  setIsEditingName(false);
                }
                if (e.key === 'Escape') {
                  setTempName(config.name || 'My Layout');
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className={styles.nameInput}
            />
          ) : (
            <div 
              className={styles.configName} 
              onClick={() => setIsEditingName(true)}
              title="Click to edit name"
            >
              {config.name || 'My Layout'}
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.btn} 
            onClick={handleReset}
            style={{ color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <Trash2 size={16} /> Reset
          </button>

          <input 
            type="file" 
            accept=".kconfig,.json" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button 
            className={styles.btn} 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} /> Import
          </button>
          
          <button 
            className={styles.btn} 
            onClick={() => exportToKConfig(config)}
          >
            <Download size={16} /> Export
          </button>
          
          <button 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => exportToKbd(config)}
          >
            <Download size={16} /> Export kbd
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  return (
    <ConfigProvider>
      <MainApp />
    </ConfigProvider>
  );
}

export default App;
