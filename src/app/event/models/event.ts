export class Event {

  constructor(public id: number,
              public created_on: string,
              public start_date: string,
              public end_date: string,
              public title: string,
              public description: string,
              public image: string,
              public attachment_link: string,
              public payment_applicable: number,
              public payment_amount: string,
              public payment_reference: string,
              public payment_instructions: string,
              public min_payment_amount: string,
              public max_payment_amount: string,
              public payment_ref_append_lastname: number,
              public payment_allow_user_to_set: number,
              public timezone_offset: number,
              public link1_url: string,
              public link1_title: string,
              public link2_url: string,
              public link2_title: string,
              public link3_url: string,
              public link3_title: string,
              public active: number,
              public payment_auto_increment: number) {

  }

}
