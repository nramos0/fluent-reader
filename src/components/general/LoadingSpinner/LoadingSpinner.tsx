import './LoadingSpinner.scss';

interface Props {
    size: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<Props> = ({ size }) => {
    return <div className={'lds-dual-ring-' + size}></div>;
};

export default LoadingSpinner;
