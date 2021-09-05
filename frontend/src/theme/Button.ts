const type1 = (): any => {
    return {
        bgColor: '#661919',
        color: 'white',
        border: '2px solid #661919',
        _hover: {
            bgColor: 'white',
            color: '#661919',
        },
        _active: {
            borderColor: '#ccc',
            bgColor: '#ccc',
        },
    };
};

const type2 = () => {
    const base = type1();
    base.border = '2px solid white';
    return base;
};

const type3 = () => {
    const base = type1();

    base.border = '1px solid transparent';
    base._hover.border = '1px solid #661919';
    base._active.border = '1px solid #661919';

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
