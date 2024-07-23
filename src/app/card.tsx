import Image from 'next/image';
import React from 'react';

interface CardProps {
    imageSrc: string;
    title: string;
    description: string;
    githubLink: string;
    docsLink: string;
}

const Card: React.FC<CardProps> = ({ imageSrc, title, description, githubLink, docsLink }) => {
    return (
        <div className="flex rounded-2xl border-favorite flex-col md:flex-row border-2 p-4 mb-10 mx-auto w-full max-w-sm md:max-w-md lg:max-w-3xl bg-201a1a">
            <div className="w-1/3 max-w-34 max-h-34">
                <Image src={imageSrc} alt={title} width={100} height={100} className="object-cover w-full md:max-w-30 md:max-h-30 lg:max-w-34 lg:max-h-34 sm:max-w-16 sm:max-h-16"/>
            </div>
            <div className="w-full md:w-2/3 pl-0 md:pl-4 mt-4 md:mt-0">
                <h2 className="text-white text-lg md:text-xl sm:text-sm font-bold mb-2 font-joekubert">{title}</h2>
                <p className="text-slate-100 mb-4 font-joekubert sm:text-xs">{description}</p>
                <div className="flex space-x-4">
                    <a href={githubLink} className="bg-382d2d text-slate-100 py-2 font-joekubert px-4 rounded-full border-favorite border-2" target="_blank" rel="noopener noreferrer">
                        GitHub
                    </a>
                    <a href={docsLink} className="bg-382d2d text-slate-100 py-2 font-joekubert px-4 rounded-full border-favorite border-2" target="_blank" rel="noopener noreferrer">
                        Docs
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Card;