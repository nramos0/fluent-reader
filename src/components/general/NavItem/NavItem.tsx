import React from 'react';
import { Link } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

interface Props {
    location: string;
    floatBottom?: boolean;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

const NavItem: React.FC<Props> = (props) => {
    const location = useLocation();

    const isSelected = location.pathname === props.location;
    return (
        <Link
            as={RouterLink}
            onClick={props.onClick}
            to={props.location}
            p={3}
            mt={props.floatBottom ? 'auto' : 'inherit'}
            fontSize={{ base: 'x-small', sm: 'sm', lg: 'lg' }}
            bgColor={isSelected ? '#d16161' : 'white'}
            color={isSelected ? 'white' : '#661919'}
            width="100%"
            textAlign="right"
            _hover={{
                backgroundColor: '#d16161',
                color: 'white',
            }}
        >
            {props.children}
        </Link>
    );
};

export default NavItem;
