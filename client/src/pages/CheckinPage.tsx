import React from "react";
import './Checkinstyle.css'
export class CheckInPage extends React.Component{

    handleChange = (event : any) => {
        event.preventDefault();
        const { name, value } = event.target;
        this.setState({[name]: value});
        console.log(this.state) ;
    }


      constructor(props: any) {
        super(props);
        this.state = {
           username : null,
           email : null,
         }
    }

    handleSubmit = (event : any) => {}

    render() {
        return (
          <div className='wrapper'>
            <div className='form-wrapper'>
               <h2>Check In</h2>
               <form onSubmit={this.handleSubmit} noValidate >
                  <div className='fullName'>
                     <label htmlFor="fullName">Full Name </label>
                     <input type='text' name='fullName' onChange={this.handleChange}/>
                  </div>
                  <div className='email'>
                     <label htmlFor="email">Email</label>
                     <input type='email' name='email' onChange={this.handleChange}/>
                  </div>
                  <div className='submit'>
                     <button>Register Me</button>
                  </div>
             </form>
         </div>
      </div>
     );
    }
}