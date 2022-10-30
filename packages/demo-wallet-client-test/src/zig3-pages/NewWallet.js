import React, { useEffect, useState } from "react";
import { Tab, Row, Col } from 'react-bootstrap';
import { AccountInfo } from "components/AccountInfo";
import { Assets } from "components/Assets";
// import { BalanceInfo } from "components/BalanceInfo"
// import { SendAndReceive } from "../components/SendAndReceive/SendAndReceive";
// import { ThemeConsumer } from '../context/ThemeContext';
import { TransactionHistory } from "components/TransactionHistory";
import { useNavigate, useLocation } from "react-router";
import { metrics } from "@stellar/frontend-helpers";

import { METRIC_NAMES } from "constants/metricNames";
import { useRedux } from "hooks/useRedux";
import { ActionStatus, SearchParams } from "types/types.d";
import { searchParam } from "helpers/searchParam";
import { BalanceInfo } from "../components/BalanceInfo";
import { Modal } from "@stellar/design-system";
import { resetActiveAssetAction } from "ducks/activeAsset";
import { useDispatch } from "react-redux";
import { SendPayment } from "components/SendPayment";
import { fetchFlaggedAccountsAction } from "ducks/flaggedAccounts";
import { fetchMemoRequiredAccountsAction } from "ducks/memoRequiredAccounts";
import "@stellar/design-system/build/styles.min.css";
export default function NewWallet() {
  const { account } = useRedux("account");
  const [sendPaymentModalVisible, setSendPaymentModalVisible] = useState(false);
  const [currentAsset, setCurrentAsset] = useState();
  const dispatch = useDispatch()
  console.log('account newwallet:', account)
  // const [Keys, setKeys] = useState();
  //   const keys = JSON.parse(localStorage.getItem('keys'))

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    metrics.emitMetric(METRIC_NAMES.viewHome);
  }, []);
  useEffect(() => {
    dispatch(fetchFlaggedAccountsAction());
    dispatch(fetchMemoRequiredAccountsAction());
  }, [dispatch]);

  useEffect(() => {
    if (account.status === ActionStatus.SUCCESS && !account.isAuthenticated) {
      navigate(
        searchParam.update(SearchParams.SECRET_KEY, account.secretKey),
      );
    }
  }, [
    account.secretKey,
    account.status,
    account.isAuthenticated,
    navigate,
    location,
  ]);

    const handleSendPayment = (asset) => {
      setCurrentAsset(asset);
      setSendPaymentModalVisible(true);
    };
    const handleCloseModal = () => {
      setSendPaymentModalVisible(false);
      dispatch(resetActiveAssetAction());
    };
    const CSS_MODAL_PARENT_ID = "root";
  return (
    <>
      <div className="settings mtb15" style={{overflow: 'auto', height: '100vh'}}>
        <div className="container-fluid">
          <Tab.Container defaultActiveKey="wallet">
            <Row>
              <Col lg={6} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '5%'}}>
                <AccountInfo/>
              </Col>
              <Col lg={6}>
                <BalanceInfo/>
                  {/* <SendAndReceive/> */}
              </Col>
              <Col lg={12}>
                <Assets onSendPayment={handleSendPayment} />
              </Col>
              {/* <Col lg={12}>
                  <ClaimableBalance onAssetAction={handleAssetAction} />
              </Col> */}
              <Col lg={12} style={{height: '100vh'}}>
                  <TransactionHistory/>
              </Col>
            </Row>
          </Tab.Container>
        </div>
        <Modal
        visible={Boolean(sendPaymentModalVisible)}
        onClose={handleCloseModal}
        parentId={CSS_MODAL_PARENT_ID}
      >
        {/* Send payment */}
        <SendPayment asset={currentAsset} onClose={handleCloseModal} />
      </Modal>
      </div>
    </>
  );
}
