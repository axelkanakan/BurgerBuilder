import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect} from 'react-router-dom';

import Input from '../../Components/UI/Input/Input';
import Button from '../../Components/UI/Button/Button';
import Spinner from '../../Components/UI/Spinner/Spinner';
import classes from './Auth.css';
import * as actions from '../../Store/Actions/index';
import { updateObject, checkvalidity } from '../../Shared/utility';



class Auth extends Component {
    state = {
        controls:{
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: "Mail Address" 
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
                },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder:"Password" 
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                valid: false,
                touched: false
                }

            },
            isSignUp:true
    }
    componentDidMount(){
        if (!this.props.buildingBurger && this.props.authRedirectPath !== '/'){
            this.props.onSetAuthRedirectPath();
        }
    }



    inputChangedHandler = (event,controlName) => {
        const updatedControls = updateObject(this.state.controls, {
            [controlName]: updateObject(this.state.controls[controlName],{
                value: event.target.value,
                valid: checkvalidity(event.target.value, this.state.controls[controlName].validation),
                touched: true
            })
        });
        this.setState({controls: updatedControls});
    }
    
    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, this.state.isSignUp)
    }
    
    switchAuthModeHandler = () => {
        this.setState( prevState =>{
            return {isSignUp: !prevState.isSignUp};
        })
    }

    render () {
        const formElementsArray = [];
            for(let key in this.state.controls){
                formElementsArray.push({
                    id:key, 
                    config: this.state.controls[key]
                });
            }
        let form = formElementsArray.map(formElement => (
            <Input 
                key={formElement.id}
                elementType = {formElement.config.elementType}
                elementConfig={formElement.config.elementConfig}
                value={formElement.config.value}
                changed={ (event) => this.inputChangedHandler(event,formElement.id)}
                invalid={!formElement.config.valid}
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
            />
        ));

        if (this.props.loading) {
            form = <Spinner />
        }

        let errorMessage = null;

        if(this.props.error){
           errorMessage =  (
               <p>{this.props.error.message}</p>
           )
        }
        
        let authRedirect = null;
        if(this.props.isAthenticated) {
            authRedirect= <Redirect to={this.props.authRedirectPath} />
        }

        return (
            <div className={classes.Auth}>
            {authRedirect}
            {errorMessage}
                <form onSubmit={this.submitHandler}>
                {form}
                <Button btnType='Success'>SUBMIT</Button>
                </form>
                <Button 
                    clicked={this.switchAuthModeHandler}
                    btnType='Danger'>SWITCH TO {this.state.isSignUp ? 'SIGNIN':'SIGNUP' }</Button>
            </div>
        );
    }
};
const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAthenticated: state.auth.token !== null,
        buildingBurger: state.burgerBuilder.building,
        authRedirectPath: state.auth.authRedirectPath
    };
};


const mapDispatchToProps = dispatch => {
    return{
        onAuth: (email, password, isSignUp) => dispatch(actions.auth(email, password, isSignUp)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
    }
};


export default connect(mapStateToProps, mapDispatchToProps)(Auth);