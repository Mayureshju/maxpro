import {defineConfig, devices} from '@playwright/test';

const port=Number(process.env.PLAYWRIGHT_PORT??3000);
const baseURL=`http://127.0.0.1:${port}`;
export default defineConfig({
  testDir:'./tests/e2e',
  timeout:20_000,
  expect:{timeout:8_000},
  retries:process.env.CI?1:0,
  workers:4,
  reporter:[['list'],['html',{open:'never'}]],
  use:{baseURL,trace:'retain-on-failure',screenshot:'only-on-failure',launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}},
  projects:[
    {name:'chromium',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:1000}}},
    {name:'mobile-chromium',use:{...devices['iPhone 13'],defaultBrowserType:'chromium',viewport:{width:375,height:812}}},
  ],
  webServer:{command:`pnpm ${process.env.PLAYWRIGHT_PRODUCTION?'start':'dev'} --port ${port}`,url:`${baseURL}/en`,reuseExistingServer:!process.env.CI,timeout:120_000}
});
