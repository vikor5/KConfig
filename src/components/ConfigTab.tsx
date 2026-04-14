import React from 'react';
import { useConfig } from '../store/ConfigContext';
import styles from './ConfigTab.module.css';

export const ConfigTab: React.FC = () => {
  const { config, updateConfigText } = useConfig();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Global Configuration (defcfg)</h2>
        <p className={styles.description}>
          Define top-level configuration options like input and output devices. Just write plain KMonad configuration block text here.
        </p>
      </div>

      <textarea 
        className={styles.editor}
        value={config.config}
        onChange={(e) => updateConfigText(e.target.value)}
        placeholder="input (device-file &quot;/dev/input...&quot;) ..."
      />
    </div>
  );
};
