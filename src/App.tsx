import React, { useState, useRef } from 'react';
import { Download, Upload, FileCode2 } from 'lucide-react';
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
  const { config, loadConfig } = useConfig();
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

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.title}>
          <FileCode2 className={styles.icon} size={28} />
          KConfig
        </div>
        <div className={styles.actions}>
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
