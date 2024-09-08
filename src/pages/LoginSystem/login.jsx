import styles from './style.module.css';
import { setTitle } from '../../utils/generalFunctions';

import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from '../../lib/axios';
import useAuth from '../../hooks/auth/useAuth';
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { faUnlockKeyhole } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const Login = () => {
    setTitle();

    const { setAuth, persist, setPersist } = useAuth();
    
    const navigate = useNavigate();
    const location = useLocation();
    const redirection = location.state?.from?.pathname || '/';

    const emailRef = useRef();
    const errRef = useRef();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');

    useEffect(() => { emailRef.current.focus(); }, []);
    useEffect(() => { setErrMsg(''); }, [email, password]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/login/', 
                JSON.stringify({ email, password }), 
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            const { access_token: accessToken, token_type: tokenType, message } = response.data;

            setAuth({ email, accessToken });

            setEmail('');
            setPassword('');
            navigate(redirection, { replace: true });
        } catch (err) {
            if (!err?.response) {
                setErrMsg("The server didn't respond.");
            } else if ([400, 401].includes(err.response?.status)) {
                setErrMsg(err.response?.data?.message || 'Invalid credentials');
            } else {
                setErrMsg('Login failed.');
            }
            errRef.current.focus();
        }
    };

    const togglePersist = () => { setPersist(prev => !prev); }

    useEffect(() => {
        localStorage.setItem('persist', persist);
    }, [persist]);

    return (
        <div className={`${styles.container} container`}>
            <div className={styles.form_container}>
                <div className={styles.form}>
                    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
                        <h1 className={styles.title}>Login</h1>
                        <p ref={errRef} className={errMsg ? styles.err_message : 'hide'} aria-live="assertive">{errMsg}</p>

                        <div className={styles.input_field} style={{ marginTop: '30px' }}>
                            <FontAwesomeIcon icon={faUser} className={styles.input_icon} />
                            <input
                                type="email" id="email" ref={emailRef} autoComplete="off" placeholder='Your email'
                                onChange={(e) => setEmail(e.target.value)} value={email} required
                            />
                        </div>

                        <div className={styles.input_field}>
                            <FontAwesomeIcon icon={faUnlockKeyhole} className={styles.input_icon} />
                            <input
                                type="password" id="password" placeholder='Your password'
                                onChange={(e) => setPassword(e.target.value)} value={password} required
                            />
                        </div>
                        
                        <div style={{ marginTop: '35px' }}>
                            <input type="checkbox" id="persist_checkBox" className={styles.checkBox} onChange={togglePersist} checked={JSON.parse(persist)} />
                            <label htmlFor='persist_checkBox'>Remember me</label>
                        </div>

                        <button className={`${styles.input_field} ${styles.button} button button-full`} disabled={(!email || !password) ? true : false}>
                            Sign in
                        </button>
                    </form>

                    <div>You don't have an account? <a href="/register">Register</a></div>
                </div>
            </div>
        </div>
    );
}
