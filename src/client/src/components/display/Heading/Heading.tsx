type Props = {
    text: string;
    size: number;
    className?: string;
};

export const Heading = ({ text, size, className }: Props): JSX.Element => {
    switch (size) {
        case 1: {
            return <h1 className={'text-3xl ' + className}>{text}</h1>;
        }
        case 2: {
            return <h1 className={'text-2xl ' + className}>{text}</h1>;
        }
        default: {
            return <h1 className={'text-xl ' + className}>{text}</h1>;
        }
    }
};
