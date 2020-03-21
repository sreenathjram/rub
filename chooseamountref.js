import React, { useEffect, useState, useRef } from 'react'
import Router from 'next/router'
import { USBGrid, USBColumn } from '@usb-shield/components-react/dist/esm/grid'
import getConfig from 'next/config'
import PropTypes from 'prop-types'
// import USBAccordion from 'shield-components/USBAccordion/USBAccordion'
import USBNotification from '@usb-shield/components-react/dist/esm/notification'
import USBButton from '@usb-shield/components-react/dist/esm/button'
import USBCard from '@usb-shield/components-react/dist/esm/card'
// import USBRadio from '@usb-shield/components-react/dist/esm/radio'
import {
  USBIconInfo,
  USBIconEdit,
  USBIconModalClose
} from '@usb-shield/components-react/dist/esm/icon'

import ReadyToSend from '../readytosend'
import { setReviewModal, setSelectedAmount, setSelectedAccount } from '../../actions'
import { formatDate } from '../../utility/dateUtils'
import { formatCurrency } from '../../utility/formatCurrency'
import { ErrorMessage, LocalisedMessage } from '../../shared/constants/messages'
import { ProductCode, PaymentEnum } from '../../shared/constants/productCodes'
import ChooseAmountComponent from '../chooseamount/chooseAmount'
import ChangeDeliveryComponent from '../changeDeliveryDate'
import PayFromAccount from '../payFromAccount'

const { publicRuntimeConfig = {} } = getConfig() || {}
const { assetPrefix } = publicRuntimeConfig
const ReviewDetails = ({
  // getOwnAccountsList,
  defaultSelectedAccount,
  selectedBill,
  openReviewModal,
  selectedAmount,
  minimumPaymentAmount,
  successMessage,
  dispatch,
  selectDeliveryByDate,
  accountList,
  onSelectAccount,
  bankingHolidaysList,
  onSaveDeliveryByDate,
  getBankingHolidaysList,
  totalAmountPayed,
  intl,
  plTotalAmount,
  plIsMALTotaldisplayed,
  plMortageTotalAmount,
  plSelectedObj,
  plSetcheckBoxChecked,
  plPaymentList,
  plsetPaymentList,
  plErrorMessage
}) => {
  // useEffect(() => {
  //   getOwnAccountsList()
  // }, [getOwnAccountsList])
  // useEffect(() => {
  //   getPaymentDetails()
  // }, [getPaymentDetails])
  useEffect(() => {
    getBankingHolidaysList()
  }, [getBankingHolidaysList])

  const chooseAmtRef = useRef(null)
  const deliveryRef = useRef(null)
  const paymentRef = useRef(null)

  const USBLogo = assetPrefix ? `${assetPrefix}/images/USBLogo32px.png` : '/images/USBLogo32px.png'
  let todayFormatDate = formatDate(new Date(), intl)

  const [successMsg, setSuccessMsg] = useState(successMessage)
  const [notifcationErrorMsg, setNotifcationErrorMsg] = useState(plErrorMessage)
  const [isEditDate, setIsEditDate] = useState('')
  const [isAlertDisplay, setIsAlertDisplay] = useState(plErrorMessage)
  const [isShowWarning, setIsShowWarning] = useState(true)

  const toggleCard = type => {
    dispatch({ type: 'SET_API_REQUEST_PROGRESS', apiInProgress: 0 })
    setIsEditDate(type)
  }
  const onSavePaymentLevel = () => {
    setIsEditDate('')
  }
  const validatePaymentOption = (status, msg) => {
    setIsAlertDisplay(status)
    setNotifcationErrorMsg(msg)
  }
  const saveDeliveryByDate = date => {
    setIsEditDate('')
    onSaveDeliveryByDate(date)
  }
  const isSelectedAmountGreater = () => {
    return (
      parseFloat(selectedAmount.amount) > parseFloat(defaultSelectedAccount.availableBalance) ||
      parseFloat(minimumPaymentAmount) > parseFloat(defaultSelectedAccount.availableBalance)
    )
  }
  const isFuturePayment = () => {
    // setIsValueSelected(true)
    return false
  }
  const onPayClick = () => {
    setSuccessMsg('')
    dispatch(setSelectedAmount(selectedAmount))
    dispatch(setSelectedAccount(defaultSelectedAccount))
    //  dispatch(setSelectedAmount(defaultSelectedAmount))
    if (!selectedAmount.isChecked) {
      setNotifcationErrorMsg(LocalisedMessage.ERROR_CHOOSE_AMOUNT.defaultMessage)
      setIsAlertDisplay(true)
    } else if (isSelectedAmountGreater()) {
      setNotifcationErrorMsg(LocalisedMessage.ERROR_AMOUNT_SUFFICIENT.defaultMessage)
      setIsAlertDisplay(true)
    } else if (!isFuturePayment()) {
      setIsAlertDisplay(false)
      dispatch(setReviewModal({ openReviewModal: true }))
    } else {
      dispatch({ type: 'MAKE_BILL_PAYMENT' })
    }
  }
  const minimumPaymentTitle = () => {
    let productData = 'Minimum'
    if (selectedBill && selectedBill.productCode === 'MAL') {
      productData = 'Mortgage'
    } else if (selectedBill && selectedBill.productCode === 'LEA') {
      productData = 'Lease'
    }
    const paymentDueDate = formatDate(new Date(selectedBill.paymentDueDate), intl)
    const checkDueDate =
      new Date().getTime() >= new Date(selectedBill.paymentDueDate).getTime() ? 'was' : 'is'
    return `${productData}  payment ${checkDueDate} due ${paymentDueDate}`
  }
  // const getOtherAmount =
  //   parseFloat(selectedAmount.amount) > parseFloat(minimumPaymentAmount)
  //     ? parseFloat(selectedAmount.amount) - parseFloat(minimumPaymentAmount)
  //     : 0

  const defaultAccountAvailBalance =
    defaultSelectedAccount.isViewBalanceEnabled === false
      ? intl.formatMessage(LocalisedMessage.RESTRICTED)
      : formatCurrency(defaultSelectedAccount.availableBalance)

  // const deliveryByDate = () => {
  todayFormatDate =
    selectDeliveryByDate && selectDeliveryByDate.deliveryBy
      ? formatDate(new Date(selectDeliveryByDate.deliveryBy), intl)
      : todayFormatDate
  // return todayFormatDate
  // }
  const deliveryByDateWarning =
    selectDeliveryByDate && selectDeliveryByDate.deliveryBy
      ? new Date(selectDeliveryByDate.deliveryBy)
      : new Date()
  const showWarning =
    new Date(deliveryByDateWarning).getTime() > new Date(selectedBill.paymentDueDate).getTime()
  const isMALProduct = selectedBill.productCode === 'MAL'
  const isFutureDatedProduct =
    selectedBill.productCode === ProductCode.PRODUCTCODE_CCD ||
    selectedBill.productCode === ProductCode.PRODUCTCODE_BCD ||
    selectedBill.productCode === ProductCode.PRODUCTCODE_EXL

  const handleNotificaitonClick = type => {
    return type && type !== 'warning' ? setSuccessMsg('') : setIsShowWarning(!showWarning)
  }
  return (
    <div className="review-details">
      <USBGrid>
        <USBColumn mediumSpan={16} largeSpan={16}>
          <div className="review-details--headerDiv">
            <h4
              className="review-details--header"
              aria-label={intl.formatMessage(LocalisedMessage.REVIEW_DETAILS_TITLE)}
              id="billpay-reviewhead-header">
              {intl.formatMessage(LocalisedMessage.REVIEW_DETAILS_TITLE)}
            </h4>
          </div>
        </USBColumn>
        <USBColumn mediumSpan={16} largeSpan={16}>
          <div data-test="NotificationDisplay" className="review-details--notification">
            {successMsg !== '' && (
              <div className="review-details--notification-mess">
                <USBNotification
                  variant="confirmation"
                  id="review-success-msg"
                  handleClose={() => handleNotificaitonClick('confirmation')}
                  notificationData={[
                    {
                      text: successMsg,
                      linkText: null,
                      link: null
                    }
                  ]}
                  closeIconNode={<USBIconModalClose />}
                />
              </div>
            )}
            {(isAlertDisplay || !selectedBill.withdrawFundsSwitch) && (
              <div id="review-error-msg" className="review-details--notification-mess">
                <USBNotification
                  variant="error"
                  notificationData={[
                    {
                      text: !selectedBill.withdrawFundsSwitch
                        ? ErrorMessage.ERROR_INELGIBLE
                        : notifcationErrorMsg,
                      link: '#'
                    }
                  ]}
                />
              </div>
            )}
          </div>
        </USBColumn>
        {showWarning && isShowWarning && !totalAmountPayed && selectedBill.withdrawFundsSwitch && (
          <USBColumn addClasses="review-details--message-warning">
            <USBNotification
              variant="warning"
              id="review-warning-msg"
              handleClose={() => handleNotificaitonClick('warning')}
              notificationData={[
                {
                  text: 'This is after due date and may incur fees.',
                  linkText: null,
                  link: null
                }
              ]}
              closeIconNode={<USBIconModalClose />}
            />
          </USBColumn>
        )}
        <USBColumn mediumSpan={16} largeSpan={16}>
          <div className="review-details--accountdata">
            <div id="reviewpage-logo" className="review-details--accounticon">
              <img name="USBLogo" src={USBLogo} alt="USBank Logo" />
            </div>
            <div
              className="review-details--accountname"
              aria-label={`${selectedBill.nickName || selectedBill.displayName}`}
              id="billpay-displayname-div">
              {selectedBill.nickName || selectedBill.displayName}
            </div>
          </div>
        </USBColumn>
        {!totalAmountPayed && selectedBill.withdrawFundsSwitch && (
          <>
            <USBColumn mediumSpan={16} largeSpan={16}>
              <div className="review-details--top-div review-details--top-div1">
                <USBCard
                  variant="elevated"
                  headerNode={
                    <div className="review-details--amountspan">
                      <div
                        className="review-details--paymentheader"
                        aria-label={intl.formatMessage(LocalisedMessage.WANT_TO_PAY)}
                        id="billpay-wantopay-span">
                        {intl.formatMessage(LocalisedMessage.WANT_TO_PAY)}
                      </div>
                    </div>
                  }
                  footerNode={
                    <div id="rd-pl-info" style={{ display: 'flex' }}>
                      <USBIconInfo addClasses="usb-card--infoicon" />
                      <div style={{ marginLeft: '8px', marginTop: '5px' }}>
                        Learn about payment details.
                      </div>
                    </div>
                  }
                  collapseNode={
                    <span
                      className="review-details--done"
                      role="link"
                      tabIndex={0}
                      onClick={() => chooseAmtRef.current.submitChooseAmount()}
                      aria-label="Done"
                      id="billpay-done-btn-span">
                      Done
                    </span>
                  }
                  expandNode={
                    <div className="review-details--infoicon" id="review-pl-info">
                      <USBIconEdit colorVariant="interaction" />
                    </div>
                  }
                  collapsedContentNode={
                    isEditDate !== 'paymentLevel' && (
                      <>
                        <div
                          tabIndex={0}
                          className="review-details--amountspan"
                          // onClick={() => toggleCard('paymentLevel')}
                          role="link">
                          <div className="review-details--ccddate">
                            {!isMALProduct && (
                              <div>
                                {selectedAmount &&
                                parseFloat(selectedAmount.amount) !== 0 &&
                                selectedAmount.optionType
                                  ? PaymentEnum[selectedAmount.optionType]
                                  : 'Make a selection'}
                              </div>
                            )}
                            {isMALProduct && (
                              <div>
                                {selectedAmount &&
                                parseFloat(selectedAmount.amount) !== 0 &&
                                selectedAmount.optionType &&
                                selectedAmount.displayLabel
                                  ? selectedAmount.displayLabel
                                  : 'Make a selection'}
                              </div>
                            )}
                            <span data-test="currency" id="billpay-makeaselection-div">
                              {selectedAmount &&
                              selectedAmount.amount &&
                              parseFloat(selectedAmount.amount) !== 0
                                ? `(${formatCurrency(selectedAmount.amount)})`
                                : ''}
                            </span>
                          </div>
                        </div>
                      </>
                    )
                  }>
                  <div>
                    <ChooseAmountComponent
                      ref={chooseAmtRef}
                      selectedBill={selectedBill}
                      selectedAmount={selectedAmount}
                      dispatch={dispatch}
                      type="internalPayment"
                      onSavePaymentLevel={onSavePaymentLevel}
                      validatePaymentOption={validatePaymentOption}
                      intl={intl}
                      plTotalAmount={plTotalAmount}
                      plIsMALTotaldisplayed={plIsMALTotaldisplayed}
                      plMortageTotalAmount={plMortageTotalAmount}
                      plSelectedObj={plSelectedObj}
                      plSetcheckBoxChecked={plSetcheckBoxChecked}
                      plPaymentList={plPaymentList}
                      plsetPaymentList={plsetPaymentList}
                    />
                  </div>
                </USBCard>
              </div>
            </USBColumn>

            <USBColumn mediumSpan={16} largeSpan={16}>
              <div className="review-details--top-div">
                <USBCard
                  variant="elevated"
                  headerNode={
                    <div className="review-details--amountspan">
                      <div
                        className="review-details--paymentheader"
                        aria-label={intl.formatMessage(LocalisedMessage.DELIVER_HEADER)}
                        id="billpay-deliverby-span">
                        {intl.formatMessage(LocalisedMessage.DELIVER_HEADER)}
                      </div>
                    </div>
                  }
                  footerNode={
                    <div id="rd-cdd-info" style={{ display: 'flex' }}>
                      <USBIconInfo addClasses="usb-card--infoicon" />
                      <div style={{ marginLeft: '8px', marginTop: '5px' }}>
                        When will my payment arrive?
                      </div>
                    </div>
                  }
                  collapseNode={
                    <span
                      tabIndex={0}
                      className="review-details--done"
                      data-test="on-save-delivery-bydate"
                      role="link"
                      onClick={() => deliveryRef.current.onSaveDeliveryByDate()}>
                      Done
                    </span>
                  }
                  expandNode={
                    isFutureDatedProduct && (
                      <div className="review-details--infoicon" id="review-cd-info">
                        <USBIconEdit colorVariant="interaction" />
                      </div>
                    )
                  }
                  collapsedContentNode={
                    isEditDate !== 'changeDelivery' && (
                      <>
                        <div
                          tabIndex={0}
                          className="review-details--amountspan"
                          // onClick={() => isFutureDatedProduct && toggleCard('changeDelivery')}
                          role="link">
                          <div className="review-details--ccddate" id="rd-todayFormatDate">
                            {todayFormatDate}
                          </div>
                        </div>
                        <div className="review-details--amountspan">
                          <p className="review-details--minp" id="review-cd-amountdue">
                            {minimumPaymentTitle()}
                          </p>
                        </div>
                      </>
                    )
                  }>
                  <div>
                    <ChangeDeliveryComponent
                      ref={deliveryRef}
                      selectDeliveryByDate={todayFormatDate}
                      selectedBill={selectedBill}
                      bankingHolidaysList={bankingHolidaysList}
                      onSaveDeliveryByDate={saveDeliveryByDate}
                      intl={intl}
                    />
                  </div>
                </USBCard>
              </div>
            </USBColumn>

            <USBColumn mediumSpan={16} largeSpan={16}>
              <div className="review-details--top-div review-details--bottom-div">
                <USBCard
                  variant="elevated"
                  headerNode={
                    <div className="review-details--amountspan">
                      <div
                        className="review-details--paymentheader"
                        aria-label={intl.formatMessage(LocalisedMessage.PAY_FROM)}
                        id="billpay-from-div">
                        {intl.formatMessage(LocalisedMessage.PAY_FROM)}
                      </div>
                    </div>
                  }
                  footerNode={
                    <div id="rd-pl-payfrom" style={{ display: 'flex' }}>
                      <USBIconInfo addClasses="usb-card--infoicon" />
                      <div style={{ marginLeft: '8px', marginTop: '5px' }}>
                        Learn about payment details.
                      </div>
                    </div>
                  }
                  collapseNode={
                    <span
                      tabIndex={0}
                      className="review-details--done"
                      data-test="save-pay-from-account"
                      id="billpay-from-account-span"
                      role="link"
                      onClick={() => paymentRef.current.savePayfromAccount()}>
                      Done
                    </span>
                  }
                  expandNode={
                    <div className="review-details--icon" id="review-pfa-edit">
                      <USBIconEdit colorVariant="interaction" />
                    </div>
                  }
                  collapsedContentNode={
                    isEditDate !== 'payfromAccount' && (
                      <div
                        tabIndex={0}
                        className="review-details--amountspan"
                        // onClick={() => toggleCard('payfromAccount')}
                        role="link">
                        <div
                          data-test="from-account"
                          className="review-details--fromaccount"
                          aria-label={`${defaultSelectedAccount.displayName} (${defaultAccountAvailBalance})`}
                          id="billpay-fromaccount-div">
                          <>
                            {defaultSelectedAccount.displayName} ({defaultAccountAvailBalance})
                          </>
                        </div>
                      </div>
                    )
                  }>
                  <div>
                    <PayFromAccount
                      ref={paymentRef}
                      accountList={accountList}
                      defaultSelectedAccount={defaultSelectedAccount}
                      onSelectAccount={onSelectAccount}
                      validatePaymentOption={validatePaymentOption}
                      onClickPayfromAccount={onSavePaymentLevel}
                      intl={intl}
                    />
                  </div>
                </USBCard>
              </div>
            </USBColumn>
          </>
        )}
        <USBColumn mediumSpan={16} largeSpan={16}>
          <div className="review-details--authorization">
            {!totalAmountPayed && (
              <div>
                <p
                  className="review-details--minp"
                  aria-label="Authorization description"
                  id="billpay-authorization-p">
                  {intl.formatMessage(LocalisedMessage.REVIEW_DETAILS_TEXT)}
                </p>
              </div>
            )}
            <div className="review-details--buttonbar">
              {!totalAmountPayed && selectedBill.withdrawFundsSwitch ? (
                <USBButton
                  id="review-paybtn"
                  variant="primary"
                  size="large"
                  handleClick={() => onPayClick()}>
                  {intl.formatMessage(LocalisedMessage.REVIEW_DETAILS_PAY_TITLE)}
                  {parseFloat(minimumPaymentAmount) === 0 && parseFloat(selectedAmount.amount) === 0
                    ? ''
                    : ` ${formatCurrency(selectedAmount.amount || minimumPaymentAmount)}`}
                </USBButton>
              ) : (
                selectedBill.productCode !== ProductCode.PRODUCTCODE_MAL &&
                selectedBill.productCode !== ProductCode.PRODUCTCODE_LOC &&
                selectedBill.withdrawFundsSwitch && (
                  <USBButton
                    variant="primary"
                    size="large"
                    id="review-autopaybtn"
                    handleClick={() => Router.push('/autopay')}>
                    {intl.formatMessage(LocalisedMessage.REVIEW_DETAILS_AUTOPAY)}
                  </USBButton>
                )
              )}
              <USBButton
                variant={!selectedBill.withdrawFundsSwitch ? 'primary' : 'text'}
                size="large"
                id="review-payanotherbtn"
                handleClick={() => Router.push('/')}>
                {!totalAmountPayed && selectedBill.withdrawFundsSwitch
                  ? LocalisedMessage.BACK_BTN.defaultMessage
                  : 'Pay another bill'}
              </USBButton>
            </div>
          </div>
        </USBColumn>
      </USBGrid>

      {openReviewModal.openReviewModal === true &&
        ReadyToSend({
          defaultSelectedAccount,
          selectedBill,
          openReviewModal,
          payValue: formatCurrency(selectedAmount.amount || minimumPaymentAmount),
          dispatch,
          todayFormatDate,
          intl
        })}
    </div>
  )
}

ReviewDetails.propTypes = {
  getOwnAccountsList: PropTypes.func.isRequired,
  defaultSelectedAccount: PropTypes.objectOf(PropTypes.any).isRequired,
  selectedBill: PropTypes.objectOf(PropTypes.any).isRequired,
  openReviewModal: PropTypes.objectOf(PropTypes.any).isRequired,
  selectedAmount: PropTypes.objectOf(PropTypes.any).isRequired,
  dispatch: PropTypes.func.isRequired,
  intl: PropTypes.objectOf(PropTypes.any),
  accountList: PropTypes.arrayOf(PropTypes.any).isRequired,
  selectDeliveryByDate: PropTypes.objectOf(PropTypes.any).isRequired,
  onSaveDeliveryByDate: PropTypes.func.isRequired,
  bankingHolidaysList: PropTypes.arrayOf(PropTypes.any).isRequired,
  minimumPaymentAmount: PropTypes.string,
  successMessage: PropTypes.string,
  onSelectAccount: PropTypes.func.isRequired,
  getBankingHolidaysList: PropTypes.func.isRequired,
  totalAmountPayed: PropTypes.bool,
  plTotalAmount: PropTypes.number,
  plIsMALTotaldisplayed: PropTypes.bool,
  plMortageTotalAmount: PropTypes.number,
  plSelectedObj: PropTypes.objectOf(PropTypes.any).isRequired,
  plSetcheckBoxChecked: PropTypes.bool,
  plPaymentList: PropTypes.arrayOf(PropTypes.any).isRequired,
  plsetPaymentList: PropTypes.arrayOf(PropTypes.any).isRequired,
  plErrorMessage: PropTypes.string
}
export default ReviewDetails
