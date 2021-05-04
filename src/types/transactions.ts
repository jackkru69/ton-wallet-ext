export type TxType = {
  account_addr: string;
  balance_delta: string;
  id: string;
  in_message: {
    dst: string;
    id: string;
    msg_type_name: string;
    src: string;
    body: string;
    status_name: string;
    value: string;
  };
  out_messages: {
    dst: string;
    id: string;
    msg_type_name: string;
    src: string;
    body: string;
    status_name: string;
    value: string;
  }[];
  comment: string;
  now: number;
  status_name: string;
  tr_type_name: string;
};

export type TxPendingType = {
  bounce: boolean;
  confirmationsMask: string;
  creator: string;
  dest: string;
  id: string;
  index: string;
  payload: string;
  sendFlags: string;
  signsReceived: string;
  signsRequired: string;
  value: string;
};
