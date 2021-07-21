import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
} from '@chakra-ui/react';
import { useHistory } from 'react-router-dom';
import NavItem from '../NavItem/NavItem';

const LogoutNavItem: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const cancelRef: React.RefObject<HTMLButtonElement> = useRef(null);

    const history = useHistory();
    const { t } = useTranslation();

    const onClose = () => {
        setIsOpen(false);
    };
    const onConfirm = () => {
        history.push('/logout');
    };

    return (
        <>
            <NavItem
                location="/logout"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                }}
            >
                {t('logout')}
            </NavItem>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered={true}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            {t('logout-confirm-title')}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {t('logout-confirm-info')}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose}>
                                {t('cancel')}
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={onConfirm}
                                ml={3}
                            >
                                {t('logout')}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default LogoutNavItem;
