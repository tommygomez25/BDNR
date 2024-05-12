import '../index.css';

const Footer = () => {
    return (
        <footer className="bg-gray-50 mt-5">
            <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                <img src="/SocialSchema_1.svg" alt="Logo" className="h-8 w-48" />

                <p className="mt-4 text-center text-sm text-gray-500 lg:mt-0 lg:text-right">
                    Copyright &copy; 2024. All rights reserved.
                </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;