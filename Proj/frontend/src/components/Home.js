import Navbar from "./NavBar";
import Header from './Header';
import CreatePost from "./CreatePost";


const Home = () => {
    return (
        <>
            <Header />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ maxWidth: '600px', width: '100%', padding: '20px' }}>
                    <CreatePost />
                </div>
            </div>
        </>

    );
}
export default Home;
