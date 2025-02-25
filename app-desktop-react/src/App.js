import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { PlatformContext, PlatformState } from './platform/PlatformContext';
import LearningPage from './learningpage/LearningPage';

const createPlatformState = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const appDesktopReact = userAgent.match(/app-desktop-react\/([\d.]+)/);
  const chrome = userAgent.match(/chrome\/([\d.]+)/);
  const electron = userAgent.match(/electron\/([\d.]+)/);
  const safari = userAgent.match(/safari\/([\d.]+)/);
  const apiBaseUrl = process.env.REACT_APP_BACKEND_API_BASE_URL;
  return new PlatformState(
    appDesktopReact ? appDesktopReact[1] : null,
    chrome ? chrome[1] : null,
    electron ? electron[1] : null,
    safari ? safari[1] : null,
    apiBaseUrl,
  );
};

function App() {
  const platformState = createPlatformState();
  return (
    <PlatformContext.Provider value={platformState}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <LearningPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </PlatformContext.Provider>
  );
}

export default App;
