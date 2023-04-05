type Props = {
    seconds: number;
    className?: string;
};

export const Duration = ({ className, seconds }: Props): JSX.Element => {
    return (
        <time dateTime={`P${Math.round(seconds)}S`} className={className}>
            {format(seconds)}
        </time>
    );
};

function format(seconds: number): string {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes().toString();
    const ss = pad(date.getUTCSeconds().toString());

    if (hh) {
        return `${hh}:${pad(mm)}:${ss}`;
    }

    return `${mm}:${ss}`;
}

function pad(string: string): string {
    return ('0' + string).slice(-2);
}
