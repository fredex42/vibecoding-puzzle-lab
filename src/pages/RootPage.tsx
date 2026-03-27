import { useEffect, useMemo, useState } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { WebContainer } from '@webcontainer/api'
import './RootPage.css'

const initialCode = `// Start coding\n`
const securePreviewDoc = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; base-uri 'none'; form-action 'none';"
    />
    <meta name="referrer" content="no-referrer" />
  </head>
  <body></body>
</html>`

let sharedWebContainer: WebContainer | null = null;
let sharedWebContainerBoot: Promise<WebContainer> | null = null;
let sharedWebContainerConsumers = 0;

async function acquireWebContainer(): Promise<WebContainer> {
  sharedWebContainerConsumers += 1;

  if (!sharedWebContainerBoot) {
    sharedWebContainerBoot = WebContainer.boot().then((container) => {
      sharedWebContainer = container;

      if (sharedWebContainerConsumers === 0) {
        container.teardown();
        sharedWebContainer = null;
        sharedWebContainerBoot = null;
      }

      return container;
    }).catch((error) => {
      sharedWebContainerBoot = null;
      sharedWebContainer = null;
      throw error;
    });
  }

  return sharedWebContainerBoot;
}

function releaseWebContainer() {
  sharedWebContainerConsumers = Math.max(0, sharedWebContainerConsumers - 1);

  if (sharedWebContainerConsumers === 0 && sharedWebContainer) {
    sharedWebContainer.teardown();
    sharedWebContainer = null;
    sharedWebContainerBoot = null;
  }
}

enum ContainerState {
    NotReady = 'not_ready',
    Booting = 'booting',
    Busy = 'busy',
    Ready = 'ready',
    Error = 'error',
};

function RootPage() {
  const [code, setCode] = useState(initialCode);
  const [containerState, setContainerState] = useState<ContainerState>(ContainerState.NotReady);
  const extensions = useMemo(() => [javascript()], [])

  let webContainerInstance: WebContainer | null = null;

  useEffect(() => {
    let isDisposed = false;

    async function setupWebContainer() {
        setContainerState(ContainerState.Booting);
        webContainerInstance = await acquireWebContainer();

        if (isDisposed) return;

        setContainerState(ContainerState.Busy)
        const fs = webContainerInstance.fs
        await fs.mkdir('/app')
        await fs.writeFile('/app/index.js', code);

        if (isDisposed) return;

        setContainerState(ContainerState.Ready);
    }

    setupWebContainer().then(() => {
        console.log('WebContainer setup complete');
        setContainerState(ContainerState.Ready);
    }).catch((error) => {
        console.error('Error setting up WebContainer:', error)
        setContainerState(ContainerState.Error);
    });

    return () => {
      isDisposed = true;
      releaseWebContainer();
    }
  }, []);

  useEffect(()=>{
    async function updateCodeInContainer() {
        if (containerState !== ContainerState.Ready || !webContainerInstance) return;

        setContainerState(ContainerState.Busy);
        const fs = webContainerInstance.fs;
        await fs.writeFile('/app/index.js', code);
        setContainerState(ContainerState.Ready);
    }

    updateCodeInContainer().catch((error) => {
        console.error('Error updating code in WebContainer:', error);
        setContainerState(ContainerState.Error);
    });
  })
  
  return (
    <main className="root-page">
      <section className="editor-column" aria-label="JavaScript editor">
        <CodeMirror
          value={code}
          height="100%"
          extensions={extensions}
          onChange={(value) => setCode(value)}
        />
      </section>

      <section className="preview-column" aria-label="Preview panel">
        <span>Container state: {containerState}</span>
        <iframe
          title="Preview"
          className="preview-frame"
          srcDoc={securePreviewDoc}
          sandbox=""
          referrerPolicy="no-referrer"
          allow="camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'; usb 'none'; fullscreen 'none';"
        />
      </section>
    </main>
  )
}

export default RootPage
