'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Check if user is authenticated on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const response = await apiService.getUserProfile();

            if (response.success && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        // Prevent multiple simultaneous registrations
        if (isRegistering) {
            return { success: false, error: 'Registration already in progress' };
        }

        try {
            setIsRegistering(true);
            const response = await apiService.registerUser(userData);
            if (response.success) {
                return { success: true, data: response };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsRegistering(false);
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            const response = await apiService.verifyUserEmail(email, otp);
            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                apiService.storeToken(response.token);
                return { success: true, data: response };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resendEmailOTP = async (email) => {
        try {
            const response = await apiService.resendUserEmailOTP(email);
            return { success: response.success, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await apiService.loginUser(credentials);

            if (response.success) {
                setUser(response.user);
                setIsAuthenticated(true);
                apiService.storeToken(response.token);
                return { success: true, data: response };
            } else if (response.requiresVerification) {
                // User needs email verification
                return {
                    success: false,
                    requiresVerification: true,
                    message: response.message,
                    email: response.email,
                    developmentOTP: response.developmentOTP
                };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await apiService.logoutUser();
            setUser(null);
            setIsAuthenticated(false);
            apiService.clearToken();
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, clear local state
            setUser(null);
            setIsAuthenticated(false);
            apiService.clearToken();
            return { success: true };
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await apiService.updateUserProfile(profileData);
            if (response.success) {
                setUser(response.user);
                return { success: true, data: response };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const addAddress = async (addressData) => {
        try {
            const response = await apiService.addUserAddress(addressData);
            if (response.success) {
                // Refresh user data to get updated addresses
                await checkAuthStatus();
                return { success: true, data: response };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const updateAddress = async (addressId, addressData) => {
        try {
            const response = await apiService.updateUserAddress(addressId, addressData);
            if (response.success) {
                // Refresh user data to get updated addresses
                await checkAuthStatus();
                return { success: true, data: response };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const deleteAddress = async (addressId) => {
        try {
            const response = await apiService.deleteUserAddress(addressId);
            if (response.success) {
                // Refresh user data to get updated addresses
                await checkAuthStatus();
                return { success: true, data: response };
            }
            return { success: false, error: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const forgotPassword = async (email) => {
        try {
            const response = await apiService.forgotUserPassword(email);
            return { success: response.success, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const resetPassword = async (email, token, newPassword) => {
        try {
            const response = await apiService.resetUserPassword(email, token, newPassword);
            return { success: response.success, message: response.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        verifyEmail,
        resendEmailOTP,
        login,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        forgotPassword,
        resetPassword,
        checkAuthStatus
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};
