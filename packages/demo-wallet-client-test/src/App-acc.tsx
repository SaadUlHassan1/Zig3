import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { Layout } from "@stellar/design-system";

import { store } from "config/store";
import { Network } from "components/Network";
import { PrivateRoute } from "components/PrivateRoute";
import { HeaderAcc as Header } from "components/HeaderAcc";

import { Dashboard } from "pages-acc/Dashboard";
import { Landing } from "pages-acc/Landing";
import { NotFound } from "pages-acc/NotFound";

import "./styles.scss";

export const AppACC = () => (
  <Provider store={store}>
    <Router>
      <Network>
        <Header />

        <Layout.Content>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route element={<NotFound />} />
          </Routes>
        </Layout.Content>

        <Layout.Footer gitHubLink="https://github.com/stellar/account-viewer-v2" />
      </Network>
    </Router>
  </Provider>
);
