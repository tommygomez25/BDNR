import Header from './Header';
import Footer from './Footer';
import CreatePost from "./CreatePost";

function NewPost() {
    return (
        <div className='h-screen flex flex-col'>
            <Header />
            <div className='mx-auto my-auto flex flex-col gap-y-2 w-3/12'>
                <CreatePost />
            </div>
            <Footer />
        </div>
    );
}

export default NewPost;
