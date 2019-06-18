import React from 'react'
import { Link } from 'react-router-dom'

function Home()
{
    return (
        <div className="container" id="home">
            <div className="row">
                <div className="col m12 center-align">
                    <h2>Polyframe</h2>
                    <h4>Quick and easy low-polygon art</h4>
                </div>
            </div>
            <div className="row center-align">
                <div className="col m6">
                    <img className="responsive-img" src="public/images/leaves-original.jpg" />
                </div>
                <div className="col m6">
                    <img className="responsive-img" src="public/images/leaves-poly.png" />
                </div>
            </div>
            <div className="row center-align">
                <Link to="/editor/">
                    <div className="btn-large editor-nav-btn">
                        Create Now
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default Home