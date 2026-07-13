type MessageProps = {
    message: string | undefined;
};

export default function InputError({ message }: MessageProps) {
    return message ? (
        <p className="text-sm text-destructive">{message}</p>
    ) : null;
}
