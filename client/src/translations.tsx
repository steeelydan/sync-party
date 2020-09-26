const translations = {
    en: {
        translation: {
            common: {
                title: 'Sync Party',
                login: 'Login',
                submit: 'Submit',
                logout: 'Logout',
                username: 'Username',
                password: 'Password',
                name: 'Name',
                next: 'Next',
                back: 'Back',
                loggedInAs: 'Logged in as',
                nowPlaying: 'Now on air',
                media: 'Media Items',
                chooseMedia:
                    'Choose a media item from the list below to start your Sync Party!',
                statusActive: 'active',
                statusStopped: 'stopped',
                user: 'User',
                userLinkTitle: 'Go to your user settings',
                close: 'Close',
                online: 'online',
                offline: 'offline',
                add: 'Add',
                approx: 'approx.',
                minLeft: 'min. left',
                party: 'Party'
            },
            player: {
                backToDashboardTitle: 'Back to Dashboard',
                goToPartyTitle: 'Edit party',
                greeting: 'Hi there!',
                greetingText:
                    'Choose a media item from the list to start your Sync Party.',
                doNotLeave:
                    'Do you really want to leave? You might experience problems with the media player coming back'
            },
            mediaMenu: {
                addMedia: 'Add media',
                addMediaTitle: 'Click to open the Add media dialog',
                mediaItemClickPlayTitle: 'Click to play',
                mediaItemClickAddTitle: 'Click to add item to party',
                mediaItemRemoveTitle: 'Click to remove from party',
                addWebTab: 'Add media from the web',
                addUserTab: 'Add media from your files',
                addFileTab: 'Upload a file',
                addWebDescription: 'Add media from the web',
                addWebUrl: 'URL',
                addNameDescription: 'Name your item',
                addFileDragDrop: 'Drag & drop a file here',
                addFileUploadDialog: '(Or click to open upload dialog)',
                collapseTitle: 'Collapse menu',
                editButtonTitle: 'Edit item name',
                userItemsEmpty: 'Currently there are no items.',
                userItemsUpload:
                    'Feel free to upload an item or add media from the web.',
                uploadFinished: 'Upload finished. File: ',
                addingFinished: 'New item was added. Name: ',
                uploadError: 'An error occured during the upload.',
                uploadLabel: 'Upload',
                clearLabel: 'Clear',
                download: 'Download',
                copy: 'Copy URL to Clipboard'
            },
            chat: {
                writeSomething: 'Write something',
                open: 'Enable chat',
                close: 'Disable chat'
            },
            dashboard: {
                newParty: 'New Party',
                yourParties: 'Your Parties',
                partyTileTitle: 'Click to join the party',
                noParties: 'Nothing there.',
                allMedia: 'All media',
                yourMedia: 'Your media',
                editPartyTitle: 'Edit Party',
                createParty: 'Create'
            },
            mediaItems: {
                headingUser: 'Your Media Items',
                headingAdmin: 'All Media Items',
                name: 'Name',
                type: 'Type',
                owner: 'Owner',
                url: 'URL / filename',
                id: 'ID',
                createdAt: 'Created',
                updatedAt: 'Updated',
                actions: 'Actions',
                delete: 'Delete'
            },
            editParty: {
                heading: 'Edit Party',
                stopParty: 'Stop Party',
                resumeParty: 'Resume Party',
                deleteParty: 'Delete Party',
                headingEditMembers: 'Edit Party Members',
                headingMembers: 'Members (click to remove)',
                headingNonMembers: 'Non-members (click to add)'
            },
            validation: {
                usernameMissing: 'Username cannot be empty',
                passwordMissing: 'Password cannot be empty'
            },
            errors: {
                userItemFetchError: 'Error getting your MediaItems.',
                userPartyFetchError: 'Error getting your parties.',
                partyCreationError: 'Error creating new party.',
                userFetchError: 'Error fetching users.',
                editPartyError: 'Error saving edited party.',
                itemFetchError: 'Error getting MediaItems',
                uploadError: 'Error at upload',
                addItemError: 'Error adding item',
                addToPartyError: 'Error adding item to party',
                removeItemError: 'Error removing item from party',
                removeLastItemError:
                    'You cannot remove the last playing item from the playlist.',
                deleteItemError: 'Error deleting item',
                itemSaveError: 'Error editing item',
                reorderError: 'Error reordering items in playlist',
                logoutError: 'Error logging out',
                metadataUpdateError: 'Error updating metadata',
                joinInactivePartyError: 'You cannot join an inactive party.'
            },
            apiResponseMessages: {
                // Not used in client atm
                noSessionOrUser: 'No session or no user',
                notAuthenticated: 'Not authenticated',
                notAuthorized: 'Not authorized',
                csrfToken: 'CSRF token missing',
                sessionFound: 'Session found',
                missingFields: 'Missing fields',
                wrongUsernameOrPassword: 'Wrong username or password',
                loginSuccessful: 'Login successful',
                logoutSuccessful: 'Logout successful',
                noFileAccess: 'No file access',
                fileUploadError: "File already exists or something's missing",
                uploadSuccessful: 'Upload successful',
                fetchingSuccessful: 'MediaItem fetching successful',
                userFetchingSuccessful: 'User fetching successful',
                noUsers: 'No users',
                mediaItemAddSuccessful: 'MediaItem added',
                mediaItemEditSuccessful: 'MediaItem edited',
                mediaItemDeleteSuccessful: 'MediaItem deleted',
                validationError: 'Validation Error',
                createPartySuccessful: 'Party created',
                partyEditSuccessful: 'Party edited or deleted',
                addUserSuccessful: 'User added to party',
                addItemSuccessful: 'Item added to party',
                itemsUpdateSuccessful: 'Item order updated',
                metadataUpdateSuccessful: 'Party Metadata updated',
                removePartyItemSuccessful: 'Item removed from party',
                partyWithSameName: 'Party with that name already exists',
                userAlreadyInParty: 'User already in party',
                itemAlreadyInParty: 'Item already in party',
                error: 'An error occurred.'
            }
        }
    }
};

export default translations;
