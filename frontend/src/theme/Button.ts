const type1 = (): any => {
    return {
        bgColor: 'c1',
        color: 'white',

        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: 'c1',

        _hover: {
            bgColor: 'white',
            color: 'c1',
        },
        _active: {
            borderColor: '#ccc',
            bgColor: '#ccc',
        },
    };
};

const type2 = () => {
    const base = type1();
    base.borderColor = 'white';
    return base;
};

const type3 = () => {
    const base = type1();

    base.borderWidth = '1px';
    base.borderColor = 'transparent';

    base._hover.borderColor = 'c1';
    base._active.borderColor = 'c1';

    return base;
};

const styles = {
    baseStyle: {},
    variants: {
        type1,
        type2,
        type3,
    },
};

export default styles;
