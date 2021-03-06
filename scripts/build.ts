import { build } from 'electron-builder';

build({
  config: {
    productName: 'Automan',
    copyright: '© 2021 FastLabel and other contributors.',
    files: ['dist/**/*'],
    directories: {
      output: 'release',
    },
    win: {
      target: ['nsis'],
      publisherName: 'FastLabel',
      icon: 'icon/favicon-512.png',
      fileAssociations: [
        {
          ext: ['bmp', 'gif', 'jpeg', 'jpg', 'png', 'ico', 'svg', 'webp'],
          description: 'Image files',
        },
      ],
    },
    nsis: {
      oneClick: false,
      perMachine: false,
      createDesktopShortcut: false,
      createStartMenuShortcut: true,
      artifactName: '${productName}-${version}-${platform}-installer.${ext}',
    },
    mac: {
      category: 'public.app-category.photography',
      target: {
        target: 'default',
        arch: ['x64', 'arm64'],
      },
      icon: 'icon/favicon-512.png',
      // dmg should not use below it make error
      // extendInfo: {
      // },
      identity: null,
    },
    linux: {
      target: ['AppImage'],
    },
  },
}).catch((err: any) => console.log(err));
