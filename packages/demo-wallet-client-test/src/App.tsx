// import React, { useState } from "react";
// import { AppACC } from "App-acc";
// import { AppSDW } from "App-sdw";

// export const App = () => {
//   const [isSdw, setIsSdw] = useState(false);
//   return (
//     <>
//       <button onClick={() => setIsSdw(!isSdw)}>Change App</button>
//       {isSdw ? <AppSDW /> : <AppACC />}
//     </>
//   );
// };
import { Component } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Index from "./zig3-pages";
// import './App.scss';
import { Provider } from "react-redux";
// import { store } from 'config/store';
import { store } from "config/store";
import { SettingsHandler } from "components/SettingsHandler";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/ionicons.min.css';
import './assets/scss/style.scss';
import './App-zig.scss';
import "./App.scss";
export class App extends Component {
  state = {
    theme: "light",
  };
  render() {
    return (
      <>
        <Provider store={store}>
          <BrowserRouter>
            <SettingsHandler>

                <ThemeProvider
                  value={{
                    data: this.state,
                    update: () => {
                      this.setState({
                        theme: this.state.theme === "light" ? "dark" : "light",
                      });
                    },
                  }}
                >
                  <Index />
                </ThemeProvider>
            </SettingsHandler>
          </BrowserRouter>
        </Provider>
      </>
    );
  }
}

export const ScrollToTop = () => {
  // window.scrollTo(0, 0);
  return null;
};
