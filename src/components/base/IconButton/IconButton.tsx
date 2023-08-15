import './IconButton.scss';

type IconButtonProps = {
    name: string;
    iconpath: string;
    callback?: Function;
    disabled?: boolean;
};

const IconButton = ({ 
    name, 
    iconpath, 
    callback = undefined,
    disabled = false
 }:IconButtonProps) => {
    
    return (
        <div className={`icon-button ${disabled ? "disabled" : ""}`}
                onClick={callback? () => callback() : undefined} >
            <img src={iconpath} className="icon" alt={name} />
        </div>
    )
}

export default IconButton;