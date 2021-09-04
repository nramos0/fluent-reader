import StoreContext, { store } from './store';

const StoreWrapper: React.FC<{}> = (props) => {
    return (
        <StoreContext.Provider value={store}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreWrapper;
