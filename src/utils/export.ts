import type { KMonadConfig } from '../types';

export const exportToKConfig = (config: KMonadConfig) => {
  const json = JSON.stringify(config, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.kconfig';
  a.click();
  
  URL.revokeObjectURL(url);
};

export const exportToKbd = (config: KMonadConfig) => {
  let kbdContent = '';

  // 1. Defcfg block
  if (config.config.trim()) {
    kbdContent += `(defcfg\n  ${config.config.trim().replace(/\\n/g, '\n  ')}\n)\n\n`;
  }

  // 2. Defsrc block
  if (config.src.length > 0) {
    kbdContent += `(defsrc\n  ${config.src.join(' ')}\n)\n\n`;
  }

  // 3. Defalias block
  if (config.alias.length > 0) {
    kbdContent += `(defalias\n`;
    config.alias.forEach(a => {
      kbdContent += `  ${a.name} ${a.value}\n`;
    });
    kbdContent += `)\n\n`;
  }

  // 4. Deflayer blocks
  config.layers.forEach(layer => {
    kbdContent += `(deflayer ${layer.name}\n  `;
    // We must output mappings in the EXACT order defined by `config.src`
    const mappedKeys = config.src.map(srcKey => {
      const mapping = layer.mappings.find(m => m.src === srcKey);
      // Default to "transparent" (_) or the srcKey itself if not mapped? 
      // Typically KMonad uses the srcKey or '_' or fallthrough. Let's use 
      // the key itself if no mapping is found, or maybe '_'? Let's just use the srcKey if not explicitly mapped.
      return mapping && mapping.dest ? mapping.dest : srcKey;
    });
    
    kbdContent += `${mappedKeys.join(' ')}\n)\n\n`;
  });

  const blob = new Blob([kbdContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'config.kbd';
  a.click();
  
  URL.revokeObjectURL(url);
};

export const importFromKConfig = (
  file: File, 
  onLoad: (config: KMonadConfig) => void,
  onError: (msg: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const result = e.target?.result as string;
      const parsed = JSON.parse(result) as KMonadConfig;
      onLoad(parsed);
    } catch (err) {
      onError('Failed to parse .kconfig file. Ensure it is valid JSON.');
    }
  };
  reader.onerror = () => onError('Failed to read file.');
  reader.readAsText(file);
};
