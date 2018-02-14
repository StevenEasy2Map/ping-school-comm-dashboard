export interface INotice {

  id: number;
  created_on: string;
  show_date: string;
  hide_date: string;
  title: string;
  description: string;
  image: string;
  attachment_link: string;
  payment_applicable: number;
  payment_amount: number;
  payment_reference: string;
  payment_instructions: string;
  min_payment_amount: string;
  max_payment_amount: string;
  payment_ref_append_lastname: number;
  payment_allow_user_to_set: number;
  link1_url: string;
  link1_title: string;
  link2_url: string;
  link2_title: string;
  link3_url: string;
  link3_title: string;
  active: number;
  homework: number;
  payment_auto_increment: number;
  payment_title: string;
}




